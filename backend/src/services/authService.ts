import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { env } from '../config/env';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errorTypes';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static generateAccessToken(userId: string, email: string): string {
    const options: jwt.SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, options);
  }

  static generateRefreshToken(userId: string, email: string): string {
    const options: jwt.SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ userId, email }, env.JWT_REFRESH_SECRET, options);
  }

  static async saveRefreshToken(
    userId: string,
    token: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  }

  static async register(data: RegisterData): Promise<{ user: IUser; tokens: TokenPair }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await User.create(data);

    // Generate tokens
    const accessToken = this.generateAccessToken(String(user._id), user.email);
    const refreshToken = this.generateRefreshToken(String(user._id), user.email);

    // Save refresh token
    await this.saveRefreshToken(String(user._id), refreshToken);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async login(data: LoginData): Promise<{ user: IUser; tokens: TokenPair }> {
    // Find user with password field
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(String(user._id), user.email);
    const refreshToken = this.generateRefreshToken(String(user._id), user.email);

    // Save refresh token
    await this.saveRefreshToken(String(user._id), refreshToken);

    // Remove password from response
    user.password = undefined as any;

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async refreshAccessToken(
    refreshTokenString: string
  ): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshTokenString,
        env.JWT_REFRESH_SECRET
      ) as { userId: string; email: string };

      // Check if refresh token exists in database
      const storedToken = await RefreshToken.findOne({
        token: refreshTokenString,
        user_id: decoded.userId,
      });

      if (!storedToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Check if token is expired
      if (storedToken.expires_at < new Date()) {
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new AuthenticationError('Refresh token expired');
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(decoded.userId, decoded.email);
      const newRefreshToken = this.generateRefreshToken(decoded.userId, decoded.email);

      // Delete old refresh token and save new one
      await RefreshToken.deleteOne({ _id: storedToken._id });
      await this.saveRefreshToken(decoded.userId, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async logout(refreshTokenString: string): Promise<void> {
    await RefreshToken.deleteOne({ token: refreshTokenString });
  }

  static async updateProfile(
    userId: string,
    data: { name: string; email: string }
  ): Promise<IUser> {
    // Check if email is being changed and is already in use
    if (data.email) {
      // Convert to lowercase for comparison since model uses lowercase: true
      const normalizedEmail = data.email.toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: data.name, email: data.email },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens for this user
    await RefreshToken.deleteMany({ user_id: userId });
  }
}
