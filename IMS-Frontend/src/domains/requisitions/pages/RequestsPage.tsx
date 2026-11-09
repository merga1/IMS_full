import { useState, useEffect } from "react";
import { useRequestStore } from "@/domains/requisitions/store";
import { useAuthStore } from "@/state/auth.store";
import { useInventoryStore } from "@/domains/inventory/store";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Check, ChevronRight, Loader2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/shared/hooks/use-toast";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function RequestsPage() {
  const { user } = useAuthStore();
  const { skus } = useInventoryStore();
  const { createRequestBackend, fetchRequisitions } = useRequestStore();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchRequisitions();
  }, [fetchRequisitions]);

  const [step, setStep] = useState(1);
  const [isThirdParty, setIsThirdParty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productCategory: '', // Main Category (e.g. Electronics)
    subCategory: '',     // Sub Category / Asset Type (e.g. SERIALIZED)
    itemSkuId: '',
    quantity: 1,
    reason: '',
    thirdPartyName: '',
    contractExpiry: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const canSponsor = user?.role === 'TEAM_LEADER' || user?.role === 'GD';

  // Helper filters
  const uniqueProductCategories = Array.from(new Set(skus.map(s => s.productCategory || 'Uncategorized')));

  // Get available sub-categories for the selected product category
  const availableSubCategories = Array.from(new Set(
    skus
      .filter(s => (s.productCategory || 'Uncategorized') === formData.productCategory)
      .map(s => s.category)
  ));

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const res = await createRequestBackend({
      sku_id: formData.itemSkuId,
      quantity: Number(formData.quantity) || 1,
      reason: formData.reason
    });

    setGeneratedOTP(res.otp || Math.floor(100000 + Math.random() * 900000).toString());
    setIsSubmitting(false);
    setStep(5); // Success step (now step 5)
    toast({
      title: t('requests.request_submitted') || "Request Submitted",
      description: t('requests.toast_success')
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('requests.title')}</h1>
          <p className="text-muted-foreground">
            {user?.role === 'GD' ? t('requests.subtitle_gd') : t('requests.subtitle_std')}
          </p>
        </div>
        {canSponsor && (
          <Button
            variant={isThirdParty ? "default" : "outline"}
            size="sm"
            onClick={() => setIsThirdParty(!isThirdParty)}
            disabled={step > 1}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isThirdParty ? t('requests.standard_request') : t('requests.sponsor_third_party')}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10 ${step >= s ? 'bg-primary border-primary text-primary-foreground shadow-lg' : 'bg-background border-muted text-muted-foreground'
            }`}>
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {step === 5 ? (
            <Card className="text-center py-10 border-green-500 border-2">
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('requests.success_title')}</h2>
                <p className="text-muted-foreground mb-6">{t('requests.success_desc')}</p>

                <div className="max-w-xs mx-auto bg-muted p-6 rounded-xl border border-dashed border-primary">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t('requests.otp')}</p>
                  <p className="text-4xl font-mono font-bold tracking-widest text-primary">{generatedOTP}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  {t('requests.otp_instruction')}
                </p>

                <Button className="mt-8" onClick={() => { setStep(1); setGeneratedOTP(null); }}>{t('requests.start_new')}</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>
                  {step === 1 && (isThirdParty ? t('requests.step_identity') : t('requests.step_category'))}
                  {step === 2 && t('requests.step_subcategory')}
                  {step === 3 && t('requests.step_item')}
                  {step === 4 && t('requests.step_justification')}
                </CardTitle>
                <CardDescription>
                  {step === 1 && (isThirdParty ? t('requests.desc_identity') : t('requests.desc_category'))}
                  {step === 2 && `${t('requests.desc_subcategory')} ${formData.productCategory}.`}
                  {step === 3 && t('requests.desc_item')}
                  {step === 4 && t('requests.desc_justification')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* STEP 1: Product Category */}
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {uniqueProductCategories.map(catName => (
                      <button
                        key={catName}
                        className={`p-4 text-left rounded-lg border-2 transition-all ${formData.productCategory === catName ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => setFormData({ ...formData, productCategory: catName, subCategory: '', itemSkuId: '' })}
                      >
                        <p className="font-bold">{catName}</p>
                        <p className="text-xs text-muted-foreground">{skus.filter(s => (s.productCategory || 'Uncategorized') === catName).length} Item Types</p>
                      </button>
                    ))}
                  </div>
                )}



                {/* STEP 2: Sub-Category */}
                {step === 2 && (
                  <div className="space-y-4">
                    <Label>{t('requests.select_subcategory')} {formData.productCategory}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {availableSubCategories.map(subCat => (
                        <button
                          key={subCat}
                          className={`p-4 text-left rounded-lg border-2 transition-all ${formData.subCategory === subCat ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                          onClick={() => setFormData({ ...formData, subCategory: subCat, itemSkuId: '' })}
                        >
                          <p className="font-bold">{subCat}</p>
                          <p className="text-xs text-muted-foreground">
                            {skus.filter(s =>
                              (s.productCategory || 'Uncategorized') === formData.productCategory &&
                              s.category === subCat
                            ).length} {t('inventory.items')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Item Selection */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('requests.select_item')} ({formData.subCategory})</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, itemSkuId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('requests.search_item')} />
                        </SelectTrigger>
                        <SelectContent>
                          {skus.filter(s => (s.productCategory || 'Uncategorized') === formData.productCategory && s.category === formData.subCategory).length > 0 ? (
                            skus.filter(s => (s.productCategory || 'Uncategorized') === formData.productCategory && s.category === formData.subCategory).map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                <div className="flex items-center gap-2">
                                  <span>{item.name}</span>
                                  <Badge variant="outline" className="scale-75 text-[10px]">{item.category}</Badge>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground text-center">{t('requests.no_items')}</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('requests.quantity')}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Justification */}
                {step === 4 && (
                  <div className="space-y-4">
                    {isThirdParty && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border mb-4">
                        <div className="space-y-2">
                          <Label>{t('requests.contractor_name')}</Label>
                          <Input
                            placeholder={t('requests.contractor_placeholder')}
                            value={formData.thirdPartyName}
                            onChange={e => setFormData({ ...formData, thirdPartyName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('requests.contract_expiry')}</Label>
                          <Input
                            type="date"
                            value={formData.contractExpiry}
                            onChange={e => setFormData({ ...formData, contractExpiry: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>{t('requests.operational_justification')}</Label>
                      <Textarea
                        placeholder={t('requests.justification_placeholder')}
                        className="min-h-[120px]"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-sm border">
                      <p className="font-bold mb-2 text-primary">{t('requests.approval_chain')}</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        {isThirdParty ? (
                          <>
                            <li>{t('requests.sponsor')} ({user?.fullName})</li>
                            <li>{t('requests.deputy_gd')}</li>
                          </>
                        ) : (
                          <>
                            <li>{t('requests.team_leader')}</li>
                            <li>{t('requests.branch_director')}</li>
                            <li>{t('requests.deputy_gd')}</li>
                          </>
                        )}
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="ghost" onClick={handleBack} disabled={step === 1}>{t('requests.back')}</Button>
                {step < 4 ? (
                  <Button onClick={handleNext} disabled={
                    (step === 1 && !formData.productCategory) ||
                    (step === 2 && !formData.subCategory) ||
                    (step === 3 && !formData.itemSkuId)
                  }>
                    {t('requests.continue')} <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.reason || (isThirdParty && (!formData.thirdPartyName || !formData.contractExpiry))}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t('requests.submit_generate')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
