'use client';

import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';

export function TipsDemo() {
  const { showToast, showTip } = useToast();

  const tips = [
    'Schedule posts in advance to maintain consistent engagement!',
    'Use high-quality images for better reach on Facebook.',
    'Posts scheduled between 1-3 PM typically get more engagement.',
    'Add captions to your media for better accessibility.',
    'Review your pending posts regularly to ensure they publish on time.',
  ];

  const showRandomTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    showTip(randomTip);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={showRandomTip}>
        Show Random Tip
      </Button>
      <Button onClick={() => showToast('Post saved successfully!', 'success')}>
        Show Success
      </Button>
      <Button onClick={() => showToast('Please fill in all fields', 'warning')}>
        Show Warning
      </Button>
      <Button onClick={() => showToast('An error occurred', 'error')}>
        Show Error
      </Button>
      <Button onClick={() => showToast('New feature available!', 'info')}>
        Show Info
      </Button>
    </div>
  );
}
