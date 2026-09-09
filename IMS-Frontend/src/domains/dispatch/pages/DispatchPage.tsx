import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Search, Package, User, Calendar, Truck } from "lucide-react";
import { useRequestStore } from "@/domains/requisitions/store";
import { useAuthStore } from "@/state/auth.store";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";
import OTPVerificationModal from "../components/OTPVerificationModal";
import SignatureCaptureModal from "../components/SignatureCaptureModal";
import SerialNumberSelector from "../components/SerialNumberSelector";
import GatePassPreviewModal from "../components/GatePassPreviewModal";
import { generateGatePass, printGatePass, GatePass } from "../utils/gatePassGenerator";

type DispatchStep = 'QUEUE' | 'OTP' | 'SERIAL' | 'SIGNATURE' | 'PREVIEW';

export default function DispatchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<DispatchStep>('QUEUE');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [gatePass, setGatePass] = useState<GatePass | null>(null);

  const { user } = useAuthStore();
  const { requisitions, verifyOTP, completeDispatch } = useRequestStore();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Filter approved requests ready for dispatch
  const readyForDispatch = requisitions.filter(
    req => req.status === 'APPROVED' && !req.signature
  );

  // Apply search filter
  const filteredRequests = readyForDispatch.filter(req =>
    searchQuery === "" ||
    req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requesterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRequest = requisitions.find(r => r.id === selectedReqId);

  const handleStartDispatch = (reqId: string) => {
    setSelectedReqId(reqId);
    setCurrentStep('OTP');
  };

  const handleOTPVerify = async (otp: string): Promise<boolean> => {
    if (!selectedReqId) return false;

    const isValid = verifyOTP(selectedReqId, otp);

    if (isValid) {
      // Check if items need serial numbers
      // Don't change step here, wait for animation
      return true;
    }

    return false;
  };

  const handleOTPComplete = () => {
    if (!selectedReqId) return;

    // Check if items need serial numbers
    const req = requisitions.find(r => r.id === selectedReqId);
    // Logic remains same, assuming laptop/scanner/phone need serials
    const needsSerials = req?.items.some(item =>
      item.name.toLowerCase().includes('laptop') ||
      item.name.toLowerCase().includes('scanner') ||
      item.name.toLowerCase().includes('phone')
    );

    if (needsSerials) {
      setCurrentStep('SERIAL');
    } else {
      setCurrentStep('SIGNATURE');
    }
  };

  const handleSerialNumbersSave = (serials: string[]) => {
    setSerialNumbers(serials);
    setCurrentStep('SIGNATURE');
  };

  const handleSignatureSave = (signatureData: string) => {
    completeDispatchFlow(signatureData);
  };

  const completeDispatchFlow = async (signatureData: string) => {
    if (!selectedRequest || !user) return;

    try {
      // Generate gate pass
      const pass = await generateGatePass(
        selectedRequest,
        user.id,
        serialNumbers.length > 0 ? serialNumbers : undefined,
        signatureData
      );

      setGatePass(pass);

      // Update requisition with signature and dispatch info
      completeDispatch(
        selectedRequest.id,
        signatureData,
        serialNumbers.length > 0 ? serialNumbers : undefined,
        user.id
      );

      // Show preview
      setCurrentStep('PREVIEW');

      toast({
        title: t('dispatch.success'),
        description: t('requests.request_id') + " " + selectedRequest.id
      });
    } catch (error) {
      toast({
        title: t('dispatch.failed'),
        description: String(error),
        variant: "destructive"
      });
      console.error(error);
    }
  };

  const handlePrintGatePass = () => {
    if (gatePass) {
      printGatePass(gatePass);
    }
  };

  const handleClosePreview = () => {
    // Reset all state
    setCurrentStep('QUEUE');
    setSelectedReqId(null);
    setSerialNumbers([]);
    setGatePass(null);
  };

  const handleCloseModals = () => {
    setCurrentStep('QUEUE');
    setSelectedReqId(null);
    setSerialNumbers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t('dispatch.title')}</h1>
        <p className="text-muted-foreground">
          {user?.branch} Branch - {t('dispatch.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dispatch.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ready for Dispatch Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {t('dispatch.ready_title')}
            <Badge variant="secondary" className="ml-auto">
              {filteredRequests.length} {filteredRequests.length === 1 ? t('dispatch.request') : t('dispatch.requests')}
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('dispatch.ready_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('dispatch.no_requests')}</p>
              <p className="text-sm">{t('dispatch.no_requests_desc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <Card key={req.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Employee Info */}
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{req.requesterName}</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {req.requesterId}
                          </Badge>
                        </div>

                        {/* Request Info */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-3 h-3" />
                          <span>{t('dispatch.request_id')} {req.id}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Items */}
                        <div className="mt-3 space-y-1">
                          {req.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span>{item.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleStartDispatch(req.id)}
                        className="shrink-0"
                      >
                        {t('dispatch.verify_issue')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        open={currentStep === 'OTP'}
        onClose={handleCloseModals}
        onVerify={handleOTPVerify}
        onComplete={handleOTPComplete}
        requestId={selectedRequest?.id || ''}
        employeeName={selectedRequest?.requesterName || ''}
      />

      {/* Serial Number Selector */}
      <SerialNumberSelector
        open={currentStep === 'SERIAL'}
        onClose={handleCloseModals}
        onSave={handleSerialNumbersSave}
        itemName={selectedRequest?.items[0]?.name || ''}
        quantity={selectedRequest?.items[0]?.quantity || 1}
        availableSerials={['SN-001-2024', 'SN-002-2024', 'SN-003-2024']} // Mock data
      />

      {/* Signature Capture Modal */}
      <SignatureCaptureModal
        open={currentStep === 'SIGNATURE'}
        onClose={handleCloseModals}
        onSave={handleSignatureSave}
        employeeName={selectedRequest?.requesterName || ''}
      />

      {/* Gate Pass Preview Modal */}
      <GatePassPreviewModal
        open={currentStep === 'PREVIEW'}
        onClose={handleClosePreview}
        gatePass={gatePass}
        onPrint={handlePrintGatePass}
      />
    </div>
  );
}
