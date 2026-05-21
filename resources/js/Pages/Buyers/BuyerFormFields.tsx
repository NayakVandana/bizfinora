import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { phoneDigits } from '@/utils/indianPhone';
import { normalizeGst, normalizePan } from '@/utils/indianTaxId';
import type { BuyerFormState } from './buyerForm';
import type { BuyerFieldErrors } from './validateBuyerForm';

type Props = {
    form: BuyerFormState;
    errors?: BuyerFieldErrors;
    onChange: (patch: Partial<BuyerFormState>) => void;
};

export default function BuyerFormFields({ form, errors = {}, onChange }: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <InputLabel value="Company name *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.company_name}
                    onChange={(e) =>
                        onChange({ company_name: e.target.value })
                    }
                />
                <InputError message={errors.company_name} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Owner name *" />
                <TextInput
                    className="mt-1 block w-full"
                    value={form.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="Contact person / proprietor"
                />
                <InputError message={errors.name} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Mobile *" />
                <TextInput
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-1 block w-full"
                    value={form.phone}
                    onChange={(e) =>
                        onChange({
                            phone: phoneDigits(e.target.value).slice(0, 10),
                        })
                    }
                    placeholder="10-digit mobile number"
                />
                <InputError message={errors.phone} className="mt-1" />
            </div>
            <div>
                <InputLabel value="Email *" />
                <TextInput
                    type="email"
                    className="mt-1 block w-full"
                    value={form.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                />
                <InputError message={errors.email} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
                <InputLabel value="Address *" />
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={3}
                    value={form.address}
                    onChange={(e) => onChange({ address: e.target.value })}
                    placeholder="Street, area, city, PIN"
                />
                <InputError message={errors.address} className="mt-1" />
            </div>
            <div>
                <InputLabel value="GST" />
                <TextInput
                    className="mt-1 block w-full uppercase"
                    value={form.gst}
                    maxLength={15}
                    onChange={(e) =>
                        onChange({ gst: normalizeGst(e.target.value) })
                    }
                    placeholder="15-character GSTIN (optional)"
                />
                <InputError message={errors.gst} className="mt-1" />
            </div>
            <div>
                <InputLabel value="PAN" />
                <TextInput
                    className="mt-1 block w-full uppercase"
                    value={form.pan}
                    maxLength={10}
                    onChange={(e) =>
                        onChange({ pan: normalizePan(e.target.value) })
                    }
                    placeholder="e.g. ABCDE1234F (optional)"
                />
                <InputError message={errors.pan} className="mt-1" />
            </div>
        </div>
    );
}
