export interface InstructorResponse {
  id: number;
  name: string;
  last_name: string;
  specialty: string;
  belt_level: string;
  bio?: string;
  email: string;
  phone: string;
  experience_years: number;
  certifications?: string;
  social_media_facebook?: string;
  social_media_instagram?: string;
  social_media_twitter?: string;
  status: 'active' | 'inactive';
  photo: string;
  is_published: boolean;
}

export interface InstructorRequest {
  name: string;
  last_name: string;
  specialty: string;
  belt_level: string;
  bio?: string;
  email: string;
  phone: string;
  experience_years: number;
  certifications?: string;
  social_media_facebook?: string;
  social_media_instagram?: string;
  social_media_twitter?: string;
  status?: 'active' | 'inactive';
  photo: File;
}
