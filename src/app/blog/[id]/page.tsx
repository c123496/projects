import { BlogDetail } from '@/components/BlogDetail';
import { use } from 'react';

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">无效的文章ID</div>
          <a href="/blog" className="text-pink-500 hover:underline">
            返回列表
          </a>
        </div>
      </div>
    );
  }
  
  return <BlogDetail id={postId} />;
}
