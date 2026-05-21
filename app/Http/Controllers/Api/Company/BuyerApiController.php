<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Company;
use App\Support\IndianMobileValidator;
use App\Support\InvoicePresentation;
use Exception;
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

    public function postBuyerStore(Request $request)
    {
        try {
            /** @var Company $company */
            $company = $request->attributes->get('company');

            $validation = Validator::make($request->all(), $this->buyerRules());
            IndianMobileValidator::attachAfter($validation);
            IndianMobileValidator::attachDuplicateBuyerPhone($validation, $company->id);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $buyer = Buyer::query()->create([
                ...$validation->validated(),
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
            IndianMobileValidator::attachAfter($validation);
            IndianMobileValidator::attachDuplicateBuyerPhone(
                $validation,
                $company->id,
                $buyerId,
            );

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $buyer = Buyer::query()
                ->where('company_id', $company->id)
                ->find($buyerId);

            if ($buyer === null) {
                return $this->sendJsonResponse(false, 'Buyer not found.', null, 200);
            }

            $buyer->update(collect($validation->validated())->except('id')->all());

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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:10'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'tax_id_label' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:2000'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'swift_bic' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
