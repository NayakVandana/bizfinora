<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Company;
use App\Support\IndianMobileValidator;
use App\Support\IndianTaxIdValidator;
use App\Support\InvoicePresentation;
use Exception;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BuyerApiController extends Controller
{
    public function postBuyersList(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $buyers = Buyer::query()
                ->where('company_id', $company->id)
                ->orderBy('name')
                ->get()
                ->map(fn (Buyer $buyer) => InvoicePresentation::formatBuyer($buyer));

            return $this->sendJsonResponse(true, 'Buyers fetched successfully.', $buyers, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBuyerShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $buyer = Buyer::query()
                ->where('company_id', $company->id)
                ->find($request->input('id'));

            if ($buyer === null) {
                return $this->sendJsonResponse(false, 'Buyer not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Buyer fetched successfully.',
                InvoicePresentation::formatBuyer($buyer),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBuyerStore(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $validation = Validator::make($request->all(), $this->buyerRules());
            $this->attachBuyerValidators($validation, $company->id);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $buyer = Buyer::query()->create([
                ...$this->prepareBuyerPayload($validation->validated()),
                'company_id' => $company->id,
            ]);

            return $this->sendJsonResponse(
                true,
                'Buyer created successfully.',
                InvoicePresentation::formatBuyer($buyer),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBuyerUpdate(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $buyerId = (int) $request->input('id');

            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
                ...$this->buyerRules(),
            ]);
            $this->attachBuyerValidators($validation, $company->id, $buyerId);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $buyer = Buyer::query()
                ->where('company_id', $company->id)
                ->find($buyerId);

            if ($buyer === null) {
                return $this->sendJsonResponse(false, 'Buyer not found.', null, 200);
            }

            $buyer->update($this->prepareBuyerPayload($validation->validated()));

            return $this->sendJsonResponse(
                true,
                'Buyer updated successfully.',
                InvoicePresentation::formatBuyer($buyer->fresh()),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postBuyerDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Company $company */
            $company = $request->attributes->get('company');
            $buyer = Buyer::query()
                ->where('company_id', $company->id)
                ->find($request->input('id'));

            if ($buyer === null) {
                return $this->sendJsonResponse(false, 'Buyer not found.', null, 200);
            }

            $buyer->delete();

            return $this->sendJsonResponse(true, 'Buyer deleted successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function buyerRules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:10'],
            'address' => ['required', 'string', 'max:2000'],
            'gst' => ['nullable', 'string', 'max:15'],
            'pan' => ['nullable', 'string', 'max:10'],
        ];
    }

    private function attachBuyerValidators(
        ValidatorContract $validation,
        int $companyId,
        ?int $excludeBuyerId = null,
    ): void {
        IndianMobileValidator::attachAfter($validation);
        IndianMobileValidator::attachDuplicateBuyerPhone(
            $validation,
            $companyId,
            $excludeBuyerId,
        );

        $validation->after(function (ValidatorContract $validator): void {
            if (! $validator->errors()->has('gst')) {
                $gstMessage = IndianTaxIdValidator::messageForGst(
                    $validator->getData()['gst'] ?? null,
                );
                if ($gstMessage !== null) {
                    $validator->errors()->add('gst', $gstMessage);
                }
            }

            if (! $validator->errors()->has('pan')) {
                $panMessage = IndianTaxIdValidator::messageForPan(
                    $validator->getData()['pan'] ?? null,
                );
                if ($panMessage !== null) {
                    $validator->errors()->add('pan', $panMessage);
                }
            }
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function prepareBuyerPayload(array $validated): array
    {
        $companyName = trim((string) ($validated['company_name'] ?? ''));
        $gst = strtoupper(trim((string) ($validated['gst'] ?? '')));
        $pan = strtoupper(trim((string) ($validated['pan'] ?? '')));

        $ownerName = trim((string) ($validated['name'] ?? ''));
        $address = trim((string) ($validated['address'] ?? ''));

        return [
            'company_name' => $companyName,
            'name' => $ownerName,
            'address' => $address !== '' ? $address : null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'gst' => $gst !== '' ? $gst : null,
            'pan' => $pan !== '' ? $pan : null,
            'tax_id' => $gst !== '' ? $gst : null,
            'tax_id_label' => $gst !== '' ? 'GSTIN' : 'GSTIN',
        ];
    }
}
