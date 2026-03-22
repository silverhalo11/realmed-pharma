import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  Package,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Clock,
  CheckCircle,
  MapPin,
  Building,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CallDetailPage = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { doctors, products, calls, updateCall, deleteCall } = useAppStore();

  const call = calls.find((c) => c.id === callId);
  const doctor = doctors.find((d) => d.id === call?.doctorId);
  const [notes, setNotes] = useState(call?.notes || '');

  const callProducts = useMemo(() => {
    if (!call?.products) return [];
    return call.products.map((cp) => ({
      ...cp,
      product: products.find((p) => p.id === cp.productId),
    }));
  }, [call, products]);

  const likedCount = callProducts.filter((p) => p.status === 'liked').length;
  const removedCount = callProducts.filter((p) => p.status === 'removed').length;
  const pendingCount = callProducts.filter((p) => p.status === 'pending').length;

  const updateProductStatus = async (productId: string, status: 'pending' | 'liked' | 'removed') => {
    if (!call) return;
    const newProducts = call.products?.map((p) =>
      p.productId === productId ? { ...p, status } : p
    );
    await updateCall({
      ...call,
      products: newProducts || [],
    });
  };

  const endCall = async () => {
    if (!call) return;
    await updateCall({
      ...call,
      status: 'completed',
      notes,
    });
    navigate('/calls');
  };

  const handleDelete = async () => {
    if (!call) return;
    await deleteCall(call.id);
    navigate('/calls');
  };

  if (!call || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Call not found</p>
      </div>
    );
  }

  const isActive = call.status === 'in-progress';
  const isCompleted = call.status === 'completed';

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title={isActive ? 'Active Call' : isCompleted ? 'Call Summary' : 'Call Details'}
        back={() => navigate('/calls')}
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Call</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this call record? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {/* Status Banner */}
      {isActive && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Phone className="w-4 h-4 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Call in Progress</p>
            <p className="text-xs text-muted-foreground">Review products with the doctor</p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Call Completed</p>
            <p className="text-xs text-muted-foreground">{call.date}</p>
          </div>
        </div>
      )}

      {/* Doctor Info */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-card border p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-lg font-semibold text-secondary-foreground">
                {doctor.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-card-foreground">
                {doctor.name}
                {doctor.degree && (
                  <span className="text-muted-foreground font-normal text-sm">
                    {' '}
                    ({doctor.degree})
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              {doctor.clinic && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3" />
                  {doctor.clinic}
                </p>
              )}
              {doctor.city && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {doctor.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-xl font-bold text-accent">{likedCount}</p>
            <p className="text-xs text-muted-foreground">Liked</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-xl font-bold text-destructive">{removedCount}</p>
            <p className="text-xs text-muted-foreground">Removed</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <Package className="w-4 h-4" />
          Products ({callProducts.length})
        </h2>

        <div className="space-y-3">
          {callProducts.map((cp) => (
            <div
              key={cp.productId}
              className={`rounded-xl border p-4 transition-colors ${
                cp.status === 'liked'
                  ? 'bg-accent/10 border-accent/30'
                  : cp.status === 'removed'
                  ? 'bg-destructive/10 border-destructive/30'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">
                    {cp.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cp.product?.category}{' '}
                    {cp.product?.composition && `- ${cp.product.composition}`}
                  </p>
                  <Badge
                    variant={
                      cp.status === 'liked'
                        ? 'default'
                        : cp.status === 'removed'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="mt-2"
                  >
                    {cp.status === 'liked' && <ThumbsUp className="w-3 h-3 mr-1" />}
                    {cp.status === 'removed' && <ThumbsDown className="w-3 h-3 mr-1" />}
                    {cp.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {cp.status.charAt(0).toUpperCase() + cp.status.slice(1)}
                  </Badge>
                </div>

                {isActive && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant={cp.status === 'liked' ? 'default' : 'outline'}
                      className={`w-10 h-10 p-0 ${
                        cp.status === 'liked' ? 'bg-accent hover:bg-accent/90' : ''
                      }`}
                      onClick={() =>
                        updateProductStatus(
                          cp.productId,
                          cp.status === 'liked' ? 'pending' : 'liked'
                        )
                      }
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={cp.status === 'removed' ? 'destructive' : 'outline'}
                      className="w-10 h-10 p-0"
                      onClick={() =>
                        updateProductStatus(
                          cp.productId,
                          cp.status === 'removed' ? 'pending' : 'removed'
                        )
                      }
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Notes
        </h2>
        <Textarea
          placeholder="Add notes about this call..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
          disabled={isCompleted}
        />
      </div>

      {/* Action Button */}
      {isActive && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-4">
          <Button className="w-full h-12 text-base gap-2" onClick={endCall}>
            <CheckCircle className="w-5 h-5" />
            End Call & Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default CallDetailPage;
