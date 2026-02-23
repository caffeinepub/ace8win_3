import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllUserProfiles, useIsCallerAdmin, useDeleteUser } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserCog, Search, Trash2 } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import UserDeleteConfirmation from '../components/UserDeleteConfirmation';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Principal } from '@dfinity/principal';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: profiles, isLoading: profilesLoading } = useGetAllUserProfiles();
  const deleteUserMutation = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ principal: string; name: string } | null>(null);

  if (adminLoading || profilesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const filteredProfiles = profiles?.filter(
    (profile) =>
      profile.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.gameUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phoneNumber.includes(searchTerm)
  );

  const handleWhatsAppClick = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(Principal.fromText(userToDelete.principal));
      toast.success('User deleted successfully');
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <UserCog className="h-8 w-8 text-neon-purple" />
        <h1 className="text-3xl font-black text-neon-purple">User Management</h1>
      </div>

      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, UID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!filteredProfiles || filteredProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No users found matching your search' : 'No registered users yet'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game UID</TableHead>
                    <TableHead>Game Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{profile.gameUid}</TableCell>
                      <TableCell className="font-bold">{profile.gameName}</TableCell>
                      <TableCell>{profile.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsAppClick(profile.phoneNumber)}
                            className="gap-2"
                          >
                            <SiWhatsapp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setUserToDelete({
                                principal: 'user-principal-placeholder',
                                name: profile.gameName,
                              })
                            }
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {userToDelete && (
        <UserDeleteConfirmation
          userName={userToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setUserToDelete(null)}
          isDeleting={deleteUserMutation.isPending}
        />
      )}
    </div>
  );
}
