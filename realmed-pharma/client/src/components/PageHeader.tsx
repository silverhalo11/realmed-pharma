import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  backTo?: string;
}

const PageHeader = ({ title, action, backTo = '/' }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 bg-background/80 backdrop-blur-md px-4 py-3 border-b">
      <button
        onClick={() => navigate(backTo)}
        data-testid="button-back"
        className="p-1.5 rounded-lg hover:bg-secondary active:bg-secondary/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      <h1 className="text-lg font-bold text-foreground flex-1">{title}</h1>
      {action}
    </div>
  );
};

export default PageHeader;
