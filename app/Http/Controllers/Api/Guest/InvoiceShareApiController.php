<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Support\InvoicePresentation;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceShareApiController extends Controller
{
    public function postInvoiceShareShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'token' => ['required', 'string', 'max:64'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $invoice = Invoice::query()
                ->where('share_token', $request->input('token'))
                ->with(['buyer', 'company:id,name,slug'])
                ->first();

            if ($invoice === null) {
                return $this->sendJsonResponse(false, 'Invoice not found or sharing disabled.', null, 200);
            }

            $payload = InvoicePresentation::format($invoice);
            $payload['company_name'] = $invoice->company?->name;

            return $this->sendJsonResponse(true, 'Invoice fetched successfully.', $payload, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
