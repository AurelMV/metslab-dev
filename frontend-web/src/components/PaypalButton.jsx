import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import env from "../config/env.jsx";

export default function PaypalButton({ amount, onSuccess }) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": env.PAYPAL_CLIENT_ID,
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount } }],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order.capture();
          onSuccess(details);
        }}
      />
    </PayPalScriptProvider>
  );
}
