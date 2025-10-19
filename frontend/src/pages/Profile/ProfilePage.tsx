import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';
import { formatDateTime } from '../../utils/formatters';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!user) return null;

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEditProfile = () => {
    setEditFormData({ name: user.name, email: user.email });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const updatedUser = await authService.updateProfile(editFormData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/[a-z]/.test(passwordFormData.newPassword)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[A-Z]/.test(passwordFormData.newPassword)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    if (!/\d/.test(passwordFormData.newPassword)) {
      toast.error('Password must contain at least one number');
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        <div className="profile-grid">
          <Card>
            <div className="profile-header">
              <div className="profile-avatar-large">{getInitials(user.name)}</div>
              <div className="profile-info">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="section-title">Account Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{formatDateTime(user.createdAt)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="section-title">Actions</h2>
            <div className="action-buttons">
              <Button variant="secondary" fullWidth onClick={handleEditProfile}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                  <path
                    d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit Profile
              </Button>
              <Button variant="secondary" fullWidth onClick={handleChangePassword}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                  <path
                    d="M12.6667 7.33337H3.33333C2.59695 7.33337 2 7.93033 2 8.66671V13.3334C2 14.0698 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0698 14 13.3334V8.66671C14 7.93033 13.403 7.33337 12.6667 7.33337Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.66667 7.33337V4.66671C4.66667 3.78265 5.01786 2.93480 5.64298 2.30968C6.2681 1.68456 7.11594 1.33337 8 1.33337C8.88406 1.33337 9.7319 1.68456 10.357 2.30968C10.9821 2.93480 11.3333 3.78265 11.3333 4.66671V7.33337"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Edit Profile</h2>
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="edit-name">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                      disabled={editLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-email">Email</label>
                    <input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      required
                      disabled={editLoading}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={editLoading} disabled={editLoading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Change Password</h2>
                <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="current-password">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordFormData.currentPassword}
                        onChange={(e) =>
                          setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })
                        }
                        required
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={passwordLoading}
                      >
                        {showCurrentPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M13.359 11.238C13.759 11.638 14 12.192 14 12.8C14 14.008 13.008 15 11.8 15C11.192 15 10.638 14.759 10.238 14.359M7.8 16.8L5 19.6M16.2 7.2L19 4.4M9.8 5.2C10.515 5.068 11.251 5 12 5C16.2 5 19.6 8.4 21 12C20.2 13.96 18.8 15.6 17 16.8M12 19C7.8 19 4.4 15.6 3 12C3.8 10.04 5.2 8.4 7 7.2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 3L21 21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 5C7.8 5 4.4 8.4 3 12C4.4 15.6 7.8 19 12 19C16.2 19 19.6 15.6 21 12C19.6 8.4 16.2 5 12 5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordFormData.newPassword}
                        onChange={(e) =>
                          setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })
                        }
                        required
                        minLength={8}
                        disabled={passwordLoading}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={passwordLoading}
                      >
                        {showNewPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M13.359 11.238C13.759 11.638 14 12.192 14 12.8C14 14.008 13.008 15 11.8 15C11.192 15 10.638 14.759 10.238 14.359M7.8 16.8L5 19.6M16.2 7.2L19 4.4M9.8 5.2C10.515 5.068 11.251 5 12 5C16.2 5 19.6 8.4 21 12C20.2 13.96 18.8 15.6 17 16.8M12 19C7.8 19 4.4 15.6 3 12C3.8 10.04 5.2 8.4 7 7.2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 3L21 21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 5C7.8 5 4.4 8.4 3 12C4.4 15.6 7.8 19 12 19C16.2 19 19.6 15.6 21 12C19.6 8.4 16.2 5 12 5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="password-requirements">
                      <p className="requirements-title">Password must contain:</p>
                      <ul className="requirements-list">
                        <li className={passwordFormData.newPassword.length >= 8 ? 'valid' : ''}>
                          At least 8 characters
                        </li>
                        <li className={/[a-z]/.test(passwordFormData.newPassword) ? 'valid' : ''}>
                          One lowercase letter
                        </li>
                        <li className={/[A-Z]/.test(passwordFormData.newPassword) ? 'valid' : ''}>
                          One uppercase letter
                        </li>
                        <li className={/\d/.test(passwordFormData.newPassword) ? 'valid' : ''}>
                          One number
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordFormData.confirmPassword}
                        onChange={(e) =>
                          setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })
                        }
                        required
                        minLength={8}
                        disabled={passwordLoading}
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={passwordLoading}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M13.359 11.238C13.759 11.638 14 12.192 14 12.8C14 14.008 13.008 15 11.8 15C11.192 15 10.638 14.759 10.238 14.359M7.8 16.8L5 19.6M16.2 7.2L19 4.4M9.8 5.2C10.515 5.068 11.251 5 12 5C16.2 5 19.6 8.4 21 12C20.2 13.96 18.8 15.6 17 16.8M12 19C7.8 19 4.4 15.6 3 12C3.8 10.04 5.2 8.4 7 7.2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 3L21 21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 5C7.8 5 4.4 8.4 3 12C4.4 15.6 7.8 19 12 19C16.2 19 19.6 15.6 21 12C19.6 8.4 16.2 5 12 5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordFormData.confirmPassword && passwordFormData.newPassword !== passwordFormData.confirmPassword && (
                      <p className="password-match-error">Passwords do not match</p>
                    )}
                    {passwordFormData.confirmPassword && passwordFormData.newPassword === passwordFormData.confirmPassword && (
                      <p className="password-match-success">Passwords match</p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={passwordLoading} disabled={passwordLoading}>
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
