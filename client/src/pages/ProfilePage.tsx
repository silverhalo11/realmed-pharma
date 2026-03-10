import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Pencil, Check, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import logoImg from '@assets/realmed_bird_logo.png';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userName, userEmail, userPhone, logout, updateProfile } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);

  const handleSave = () => {
    if (!editName.trim()) return;
    updateProfile(editName.trim(), editPhone.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(userName);
    setEditPhone(userPhone);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="My Profile"
        action={
          !editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="button-edit-profile">
              <Pencil className="w-4 h-4 mr-1" />Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancel} data-testid="button-cancel-edit">
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSave} data-testid="button-save-profile">
                <Check className="w-4 h-4 mr-1" />Save
              </Button>
            </div>
          )
        }
      />

      <div className="px-4 py-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary" data-testid="text-profile-initial">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <img src={logoImg} alt="RealMed Pharma" className="w-12 h-12 object-contain mt-1" />
          <p className="text-xs text-muted-foreground mt-1">RealMed Pharma — Field Sales Hub</p>
        </div>

        <div className="rounded-xl bg-card border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Username</p>
                {editing ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 h-9"
                    data-testid="input-edit-name"
                  />
                ) : (
                  <p className="text-sm font-medium text-card-foreground" data-testid="text-profile-name">{userName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-card-foreground" data-testid="text-profile-email">{userEmail || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Mobile</p>
                {editing ? (
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 h-9"
                    type="tel"
                    placeholder="Enter mobile number"
                    data-testid="input-edit-phone"
                  />
                ) : (
                  <p className="text-sm font-medium text-card-foreground" data-testid="text-profile-phone">{userPhone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full mt-6"
          onClick={async () => { await logout(); navigate('/login'); }}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
