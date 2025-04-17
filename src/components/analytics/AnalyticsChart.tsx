import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye, ThumbsUp, MessageSquare } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  viewsData: { date: string; count: number }[];
  likesData: { date: string; count: number }[];
  commentsData: { date: string; count: number }[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  viewsData,
  likesData,
  commentsData
}) => {
  const [showViews, setShowViews] = useState(true);
  const [showLikes, setShowLikes] = useState(true);
  const [showComments, setShowComments] = useState(true);

  // Combine all dates and sort them
  const allDates = [...new Set([
    ...viewsData.map(item => item.date),
    ...likesData.map(item => item.date),
    ...commentsData.map(item => item.date)
  ])].sort();

  // Fill in missing dates with zero counts
  const filledViewsData = allDates.map(date => {
    const found = viewsData.find(item => item.date === date);
    return { date, count: found ? found.count : 0 };
  });

  const filledLikesData = allDates.map(date => {
    const found = likesData.find(item => item.date === date);
    return { date, count: found ? found.count : 0 };
  });

  const filledCommentsData = allDates.map(date => {
    const found = commentsData.find(item => item.date === date);
    return { date, count: found ? found.count : 0 };
  });

  // Format dates for display
  const labels = allDates.map(date => {
    try {
      return format(parseISO(date), 'MMM d');
    } catch (e) {
      return date;
    }
  });

  const data = {
    labels,
    datasets: [
      showViews && {
        label: 'Views',
        data: filledViewsData.map(item => item.count),
        borderColor: 'rgba(0, 255, 255, 1)',
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        tension: 0.4,
        fill: true
      },
      showLikes && {
        label: 'Likes',
        data: filledLikesData.map(item => item.count),
        borderColor: 'rgba(255, 0, 204, 1)',
        backgroundColor: 'rgba(255, 0, 204, 0.2)',
        tension: 0.4,
        fill: true
      },
      showComments && {
        label: 'Comments',
        data: filledCommentsData.map(item => item.count),
        borderColor: 'rgba(255, 165, 0, 1)',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        tension: 0.4,
        fill: true
      }
    ].filter(Boolean) as any[]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={showViews ? "default" : "outline"}
          size="sm"
          onClick={() => setShowViews(!showViews)}
          className={showViews ? "bg-[#00ffff]/20 hover:bg-[#00ffff]/30 text-white border-[#00ffff]/50" : ""}
        >
          <Eye className="h-4 w-4 mr-2" />
          Views
        </Button>
        <Button
          variant={showLikes ? "default" : "outline"}
          size="sm"
          onClick={() => setShowLikes(!showLikes)}
          className={showLikes ? "bg-[#ff00cc]/20 hover:bg-[#ff00cc]/30 text-white border-[#ff00cc]/50" : ""}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Likes
        </Button>
        <Button
          variant={showComments ? "default" : "outline"}
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className={showComments ? "bg-[#ffa500]/20 hover:bg-[#ffa500]/30 text-white border-[#ffa500]/50" : ""}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comments
        </Button>
      </div>
      
      <div className="h-[300px] w-full">
        {allDates.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
