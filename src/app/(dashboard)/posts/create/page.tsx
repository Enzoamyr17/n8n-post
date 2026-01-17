import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PostForm } from '@/components/posts/PostForm';

export default function CreatePostPage() {
  return (
    <div>
      <DashboardHeader title="Create New Post" showCreateButton={false} />
      <PostForm />
    </div>
  );
}
