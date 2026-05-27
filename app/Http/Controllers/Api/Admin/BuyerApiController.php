<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Support\InvoicePresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BuyerApiController extends Controller
{
    public function postBuyerShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $buyer = Buyer::query()
                ->with(['company:id,name,slug'])
                ->withCount('invoices')
                ->find($request->input('id'));

            if ($buyer === null) {
                return $this->sendJsonResponse(false, 'Buyer not found.', null, 200);
            }

            $data = InvoicePresentation::formatBuyer($buyer);
            $data['company_id'] = $buyer->company_id;
            $data['company'] = $buyer->company ? [
                'id' => $buyer->company->id,
                'name' => $buyer->company->name,
                'slug' => $buyer->company->slug,
            ] : null;
            $data['created_at'] = $buyer->created_at?->toIso8601String();
            $data['updated_at'] = $buyer->updated_at?->toIso8601String();
            $data['invoices_count'] = $buyer->invoices_count;

            return $this->sendJsonResponse(true, 'Buyer fetched successfully.', $data, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
