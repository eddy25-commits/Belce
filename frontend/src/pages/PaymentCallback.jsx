import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { formatGHS } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./PaymentCallback.css";
export default function PaymentCallback() {
  usePageMeta("Order Confirmation");
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed | error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const reference =
      searchParams.get("reference") ||
      searchParams.get("trxref") ||
      sessionStorage.getItem("belce_last_reference");
    if (!reference) {
      setStatus("error");
      setError("We couldn't find your payment reference.");
      return;
    }
    api
      .get(`/payment/verify/${reference}`)
      .then((res) => {
        setOrder(res.data.order);
        if (res.data.status === "success") {
          clearCart();
        }
        setStatus(res.data.status === "success" ? "success" : "failed");
        sessionStorage.removeItem("belce_last_reference");
      })
      .catch((err) => {
        setStatus("error");
        setError(getErrorMessage(err));
      });
  }, [searchParams]);
  if (status === "verifying") {
    return <Loader label="Confirming your payment..." />;
  }
  return (
    <div className="container payment-callback">
      {status === "success" && order && (
        <div className="callback-card callback-success">
          <div className="callback-icon">&#10003;</div>
          <h1>Payment Successful</h1>
          <p>
            Thank you, {order.customer.name.split(" ")[0]}! Your order{" "}
            <strong>{order.orderNumber}</strong> has been received and is being prepared.
          </p>
          <div className="callback-summary card">
            {order.items.map((item, idx) => (
              <div className="callback-summary-row" key={idx}>
                <span>
                  {item.name} &times; {item.quantity}
                </span>
                <span>{formatGHS(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="callback-summary-row callback-summary-total">
              <span>Total Paid</span>
              <span>{formatGHS(order.total)}</span>
            </div>
          </div>
          <p className="callback-note">
            A confirmation has been sent to {order.customer.email}. We'll contact you at{" "}
            {order.customer.phone} to arrange delivery to {order.customer.address}.
          </p>
          <Link to="/shop" className="btn btn-gold">
            Continue Shopping
          </Link>
        </div>
      )}
      {status === "failed" && (
        <div className="callback-card callback-failed">
          <div className="callback-icon">&times;</div>
          <h1>Payment Not Completed</h1>
          <p>
            Your payment could not be confirmed. If an amount was deducted, it will be
            reversed by Paystack automatically. You can try again below.
          </p>
          <Link to="/checkout" className="btn btn-gold">
            Try Again
          </Link>
        </div>
      )}
      {status === "error" && (
        <div className="callback-card callback-failed">
          <div className="callback-icon">!</div>
          <h1>Something Went Wrong</h1>
          <p>{error || "We could not verify your payment right now."}</p>
          <p className="callback-note">
            If you were charged, please contact us with your order details and we'll confirm it manually.
          </p>
          <Link to="/contact" className="btn btn-outline">
            Contact Us
          </Link>
        </div>
      )}
    </div>
  );
}