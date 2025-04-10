
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Medal, Trophy } from "lucide-react";
import { LeaderboardUser } from "@/types/gamification";

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  className?: string;
}

const Leaderboard = ({ users, currentUserId, className }: LeaderboardProps) => {
  // Sort users by XP (highest first)
  const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Leaderboard
        </h3>
      </div>
      
      <div className="rounded-lg border border-sortmy-gray/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-sortmy-gray/10 hover:bg-sortmy-gray/10">
              <TableHead className="w-12 text-center">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="text-right">XP</TableHead>
              <TableHead className="text-right">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user, index) => {
              const isCurrentUser = user.userId === currentUserId;
              
              return (
                <TableRow 
                  key={user.userId}
                  className={`
                    ${isCurrentUser ? 'bg-sortmy-blue/10 hover:bg-sortmy-blue/10' : ''}
                    ${index < 3 ? 'font-medium' : ''}
                  `}
                >
                  <TableCell className="text-center">
                    {index === 0 && <Medal className="w-5 h-5 text-yellow-400 mx-auto" />}
                    {index === 1 && <Medal className="w-5 h-5 text-gray-400 mx-auto" />}
                    {index === 2 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                    {index > 2 && index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-sortmy-gray/20 text-xs">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{user.username}</span>
                          {user.isPremium && (
                            <Badge variant="outline" className="ml-2 text-xs border-yellow-400/30 text-yellow-400">
                              PREMIUM
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs border-sortmy-blue/30 text-sortmy-blue">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{user.badges} badges</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.level}
                  </TableCell>
                  <TableCell className="text-right">{user.xp}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {user.streakDays > 0 && (
                        <>
                          <Flame className={`w-4 h-4 ${user.streakDays >= 7 ? 'text-red-500' : 'text-orange-400'}`} />
                          <span>{user.streakDays}</span>
                        </>
                      )}
                      {user.streakDays === 0 && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Leaderboard;
