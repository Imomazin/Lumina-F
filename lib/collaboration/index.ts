/**
 * Collaboration Module
 *
 * Real-time collaboration features including:
 * - Comments and annotations
 * - Version history
 * - Change tracking
 * - User presence
 * - Sharing and permissions
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Collaborator {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  addedAt: string;
  addedBy: string;
  lastAccess?: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface Comment {
  id: string;
  analysisId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  location: CommentLocation;
  status: CommentStatus;
  parentId?: string; // For replies
  mentions?: string[]; // User IDs
  reactions?: Reaction[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CommentLocation {
  type: 'field' | 'cell' | 'section' | 'chart' | 'general';
  field?: string;
  section?: string;
  cellRef?: string; // e.g., "B5" for spreadsheet reference
  coordinates?: { x: number; y: number };
}

export type CommentStatus = 'open' | 'resolved' | 'archived';

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Version {
  id: string;
  analysisId: string;
  versionNumber: number;
  name?: string;
  description?: string;
  snapshot: string; // JSON stringified state
  changes: VersionChange[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isAutoSave: boolean;
  size: number; // In bytes
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'deleted';
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'idle' | 'offline';
  currentSection?: string;
  currentField?: string;
  lastSeen: string;
  cursor?: { x: number; y: number };
}

export interface ShareSettings {
  analysisId: string;
  isPublic: boolean;
  publicLink?: string;
  requireAuth: boolean;
  allowComments: boolean;
  allowExport: boolean;
  expiresAt?: string;
  accessLog: AccessLogEntry[];
}

export interface AccessLogEntry {
  userId?: string;
  userEmail?: string;
  action: 'view' | 'edit' | 'comment' | 'export' | 'share';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CollaborationState {
  collaborators: Collaborator[];
  comments: Comment[];
  versions: Version[];
  presence: UserPresence[];
  shareSettings: ShareSettings | null;
  currentUserId: string | null;
  isConnected: boolean;
}

// ============================================================================
// COLLABORATION MANAGER
// ============================================================================

export class CollaborationManager {
  private state: CollaborationState = {
    collaborators: [],
    comments: [],
    versions: [],
    presence: [],
    shareSettings: null,
    currentUserId: null,
    isConnected: false,
  };

  private listeners: Set<(state: CollaborationState) => void> = new Set();
  private analysisId: string | null = null;

  constructor(analysisId?: string) {
    if (analysisId) {
      this.analysisId = analysisId;
      this.loadState();
    }
  }

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  private getStorageKey(): string {
    return `lumina_collab_${this.analysisId}`;
  }

  private loadState(): void {
    if (!this.analysisId) return;

    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (saved) {
        const data = JSON.parse(saved);
        this.state = { ...this.state, ...data };
      }
    } catch (e) {
      console.error('Failed to load collaboration state:', e);
    }
  }

  private saveState(): void {
    if (!this.analysisId) return;

    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify({
        collaborators: this.state.collaborators,
        comments: this.state.comments,
        versions: this.state.versions,
        shareSettings: this.state.shareSettings,
      }));
    } catch (e) {
      console.error('Failed to save collaboration state:', e);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  subscribe(listener: (state: CollaborationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): CollaborationState {
    return { ...this.state };
  }

  setAnalysisId(id: string): void {
    this.analysisId = id;
    this.loadState();
    this.notifyListeners();
  }

  setCurrentUser(userId: string): void {
    this.state.currentUserId = userId;
    this.notifyListeners();
  }

  // =========================================================================
  // COLLABORATORS
  // =========================================================================

  addCollaborator(
    email: string,
    role: CollaboratorRole,
    addedBy: string
  ): Collaborator {
    const collaborator: Collaborator = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: `user_${email.split('@')[0]}`,
      email,
      name: email.split('@')[0],
      role,
      addedAt: new Date().toISOString(),
      addedBy,
    };

    this.state.collaborators.push(collaborator);
    this.saveState();
    this.notifyListeners();

    return collaborator;
  }

  removeCollaborator(collaboratorId: string): boolean {
    const index = this.state.collaborators.findIndex(c => c.id === collaboratorId);
    if (index === -1) return false;

    this.state.collaborators.splice(index, 1);
    this.saveState();
    this.notifyListeners();

    return true;
  }

  updateCollaboratorRole(collaboratorId: string, role: CollaboratorRole): boolean {
    const collaborator = this.state.collaborators.find(c => c.id === collaboratorId);
    if (!collaborator) return false;

    collaborator.role = role;
    this.saveState();
    this.notifyListeners();

    return true;
  }

  getCollaborators(): Collaborator[] {
    return [...this.state.collaborators];
  }

  // =========================================================================
  // COMMENTS
  // =========================================================================

  addComment(
    content: string,
    authorId: string,
    authorName: string,
    location: CommentLocation,
    parentId?: string
  ): Comment {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      analysisId: this.analysisId || '',
      authorId,
      authorName,
      content,
      location,
      status: 'open',
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    if (mentions) {
      comment.mentions = mentions.map(m => m.substring(1));
    }

    this.state.comments.push(comment);
    this.saveState();
    this.notifyListeners();

    return comment;
  }

  updateComment(commentId: string, content: string): boolean {
    const comment = this.state.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.content = content;
    comment.updatedAt = new Date().toISOString();

    this.saveState();
    this.notifyListeners();

    return true;
  }

  resolveComment(commentId: string, resolvedBy: string): boolean {
    const comment = this.state.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.status = 'resolved';
    comment.resolvedAt = new Date().toISOString();
    comment.resolvedBy = resolvedBy;

    this.saveState();
    this.notifyListeners();

    return true;
  }

  reopenComment(commentId: string): boolean {
    const comment = this.state.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.status = 'open';
    comment.resolvedAt = undefined;
    comment.resolvedBy = undefined;

    this.saveState();
    this.notifyListeners();

    return true;
  }

  deleteComment(commentId: string): boolean {
    const index = this.state.comments.findIndex(c => c.id === commentId);
    if (index === -1) return false;

    // Also delete replies
    this.state.comments = this.state.comments.filter(
      c => c.id !== commentId && c.parentId !== commentId
    );

    this.saveState();
    this.notifyListeners();

    return true;
  }

  addReaction(commentId: string, emoji: string, userId: string, userName: string): boolean {
    const comment = this.state.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (!comment.reactions) {
      comment.reactions = [];
    }

    // Check if user already reacted with same emoji
    const existing = comment.reactions.find(r => r.userId === userId && r.emoji === emoji);
    if (existing) {
      // Remove reaction
      comment.reactions = comment.reactions.filter(r => r !== existing);
    } else {
      // Add reaction
      comment.reactions.push({
        emoji,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    }

    this.saveState();
    this.notifyListeners();

    return true;
  }

  getComments(options?: {
    status?: CommentStatus;
    location?: Partial<CommentLocation>;
    includeReplies?: boolean;
  }): Comment[] {
    let comments = [...this.state.comments];

    if (options?.status) {
      comments = comments.filter(c => c.status === options.status);
    }

    if (options?.location) {
      comments = comments.filter(c => {
        if (options.location?.type && c.location.type !== options.location.type) return false;
        if (options.location?.field && c.location.field !== options.location.field) return false;
        if (options.location?.section && c.location.section !== options.location.section) return false;
        return true;
      });
    }

    if (!options?.includeReplies) {
      comments = comments.filter(c => !c.parentId);
    }

    return comments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getReplies(commentId: string): Comment[] {
    return this.state.comments
      .filter(c => c.parentId === commentId)
      .sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }

  // =========================================================================
  // VERSION HISTORY
  // =========================================================================

  createVersion(
    snapshot: any,
    createdBy: string,
    createdByName: string,
    options?: {
      name?: string;
      description?: string;
      isAutoSave?: boolean;
    }
  ): Version {
    const snapshotStr = JSON.stringify(snapshot);
    const previousVersion = this.state.versions[this.state.versions.length - 1];

    // Calculate changes from previous version
    let changes: VersionChange[] = [];
    if (previousVersion) {
      changes = this.calculateChanges(
        JSON.parse(previousVersion.snapshot),
        snapshot
      );
    }

    const version: Version = {
      id: `version_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      analysisId: this.analysisId || '',
      versionNumber: this.state.versions.length + 1,
      name: options?.name,
      description: options?.description,
      snapshot: snapshotStr,
      changes,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      isAutoSave: options?.isAutoSave ?? false,
      size: new Blob([snapshotStr]).size,
    };

    this.state.versions.push(version);

    // Keep only last 50 versions
    if (this.state.versions.length > 50) {
      this.state.versions = this.state.versions.slice(-50);
    }

    this.saveState();
    this.notifyListeners();

    return version;
  }

  private calculateChanges(oldState: any, newState: any): VersionChange[] {
    const changes: VersionChange[] = [];

    const allKeys = new Set([
      ...Object.keys(oldState || {}),
      ...Object.keys(newState || {}),
    ]);

    allKeys.forEach(key => {
      const oldVal = oldState?.[key];
      const newVal = newState?.[key];

      if (oldVal === undefined && newVal !== undefined) {
        changes.push({ field: key, oldValue: null, newValue: newVal, changeType: 'added' });
      } else if (oldVal !== undefined && newVal === undefined) {
        changes.push({ field: key, oldValue: oldVal, newValue: null, changeType: 'deleted' });
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, oldValue: oldVal, newValue: newVal, changeType: 'modified' });
      }
    });

    return changes;
  }

  getVersions(): Version[] {
    return [...this.state.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  }

  getVersion(versionId: string): Version | undefined {
    return this.state.versions.find(v => v.id === versionId);
  }

  restoreVersion(versionId: string): any | null {
    const version = this.getVersion(versionId);
    if (!version) return null;

    return JSON.parse(version.snapshot);
  }

  compareVersions(versionId1: string, versionId2: string): VersionChange[] {
    const v1 = this.getVersion(versionId1);
    const v2 = this.getVersion(versionId2);

    if (!v1 || !v2) return [];

    return this.calculateChanges(
      JSON.parse(v1.snapshot),
      JSON.parse(v2.snapshot)
    );
  }

  // =========================================================================
  // PRESENCE
  // =========================================================================

  updatePresence(presence: Partial<UserPresence>): void {
    if (!this.state.currentUserId) return;

    const existing = this.state.presence.find(p => p.userId === this.state.currentUserId);

    if (existing) {
      Object.assign(existing, presence, { lastSeen: new Date().toISOString() });
    } else {
      this.state.presence.push({
        userId: this.state.currentUserId,
        userName: presence.userName || 'Anonymous',
        status: 'online',
        lastSeen: new Date().toISOString(),
        ...presence,
      });
    }

    this.notifyListeners();
  }

  getPresence(): UserPresence[] {
    // Filter out stale presence (more than 5 minutes old)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return this.state.presence.filter(p =>
      new Date(p.lastSeen).getTime() > fiveMinutesAgo
    );
  }

  // =========================================================================
  // SHARING
  // =========================================================================

  updateShareSettings(settings: Partial<ShareSettings>): ShareSettings {
    if (!this.state.shareSettings) {
      this.state.shareSettings = {
        analysisId: this.analysisId || '',
        isPublic: false,
        requireAuth: true,
        allowComments: true,
        allowExport: false,
        accessLog: [],
      };
    }

    Object.assign(this.state.shareSettings, settings);

    if (settings.isPublic && !this.state.shareSettings.publicLink) {
      this.state.shareSettings.publicLink =
        `${window.location.origin}/share/${this.analysisId}`;
    }

    this.saveState();
    this.notifyListeners();

    return this.state.shareSettings;
  }

  getShareSettings(): ShareSettings | null {
    return this.state.shareSettings;
  }

  generateShareLink(expiresIn?: number): string {
    const link = `${window.location.origin}/share/${this.analysisId}`;

    if (expiresIn) {
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      this.updateShareSettings({ expiresAt: expiresAt.toISOString() });
    }

    return link;
  }

  logAccess(entry: Omit<AccessLogEntry, 'timestamp'>): void {
    if (!this.state.shareSettings) return;

    this.state.shareSettings.accessLog.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 entries
    if (this.state.shareSettings.accessLog.length > 100) {
      this.state.shareSettings.accessLog =
        this.state.shareSettings.accessLog.slice(-100);
    }

    this.saveState();
  }

  // =========================================================================
  // PERMISSIONS
  // =========================================================================

  canEdit(userId: string): boolean {
    const collaborator = this.state.collaborators.find(c => c.userId === userId);
    if (!collaborator) return false;
    return ['owner', 'editor'].includes(collaborator.role);
  }

  canComment(userId: string): boolean {
    const collaborator = this.state.collaborators.find(c => c.userId === userId);
    if (!collaborator) return false;
    return ['owner', 'editor', 'commenter'].includes(collaborator.role);
  }

  canView(userId: string): boolean {
    const collaborator = this.state.collaborators.find(c => c.userId === userId);
    return !!collaborator;
  }

  isOwner(userId: string): boolean {
    const collaborator = this.state.collaborators.find(c => c.userId === userId);
    return collaborator?.role === 'owner';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(analysisId?: string): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager(analysisId);
  } else if (analysisId) {
    collaborationManager.setAnalysisId(analysisId);
  }
  return collaborationManager;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export interface CollaborationNotification {
  id: string;
  type: 'comment' | 'mention' | 'share' | 'version' | 'presence';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

export function createNotification(
  type: CollaborationNotification['type'],
  title: string,
  message: string,
  data?: any
): CollaborationNotification {
  return {
    id: `notif_${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    data,
  };
}
