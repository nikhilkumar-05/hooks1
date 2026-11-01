export interface User {
  _id: string;
  name: string;
  email: string;
  headline?: string;
  course: string;
  semester: string;
  bio?: string;
  skills?: string[];
  profileImage?: string;
  coverImage?: string;
  savedPosts?: string[];
  following?: string[];
  followers?: string[];
  isConnected?: boolean;
  isFollowing?: boolean;
  isSelf?: boolean;
  createdAt?: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  imageUrl?: string;
  likes: string[];
  commentCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  moderationStatus?: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
  moderationCategory?: string;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment?: string | null;
  likes?: string[];
  replies?: Comment[];
  createdAt: string;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  organizer: string;
  attendees: string[];
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    profileImage?: string;
    course?: string;
    semester?: string;
  };
  type: 'like' | 'comment' | 'connection_request' | 'connection_accepted' | 'follow' | 'event_rsvp';
  post?: {
    _id: string;
    content: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

export interface LiveSession {
  _id: string;
  title: string;
  host: User;
  category: 'Campus Discussion' | 'Club AMA' | 'Sports & Gaming' | 'Tech Talk' | 'Study With Me';
  status: 'live' | 'ended';
  viewersCount: number;
  tags?: string[];
  coverGradient?: string;
  createdAt: string;
}
