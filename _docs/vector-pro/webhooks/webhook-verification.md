---
title: Webhook Verification
description: Verify webhook signatures to ensure requests are authentic and haven't
  been tampered with.
category: Webhooks
order: 4
---

**Verify every webhook request.** Without signature verification, attackers can forge requests and potentially compromise your integration.

## Signature Format

The `X-Vector-Signature` header contains:

```
t=1705762200,v1=a3f8c2d1e4b5f6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1
```

- `t` - Unix timestamp when signature was generated
- `v1` - HMAC-SHA256 signature (hex-encoded)

## Verification Steps

1. Parse timestamp and signature from `X-Vector-Signature` header
2. Construct signed payload: `{timestamp}.{raw_request_body}`
3. Compute HMAC-SHA256 with your webhook secret
4. Compare computed signature with `v1` signature (constant-time comparison)
5. Verify timestamp is within 5 minutes of current time (prevents replay attacks)

## PHP Example

```php
function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
{
    // Parse signature header
    $parts = [];
    foreach (explode(',', $signature) as $part) {
        [$key, $value] = explode('=', $part, 2);
        $parts[$key] = $value;
    }

    if (!isset($parts['t'], $parts['v1'])) {
        return false;
    }

    $timestamp = (int) $parts['t'];
    $expectedSignature = $parts['v1'];

    // Verify timestamp within 5 minutes
    if (abs(time() - $timestamp) > 300) {
        return false;
    }

    // Compute signature
    $signedPayload = $timestamp . '.' . $payload;
    $computedSignature = hash_hmac('sha256', $signedPayload, $secret);

    // Constant-time comparison
    return hash_equals($computedSignature, $expectedSignature);
}

// Usage
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_VECTOR_SIGNATURE'] ?? '';
$secret = config('services.vector.webhook_secret');

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    abort(401, 'Invalid signature');
}

$event = json_decode($payload, true);
```

## Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  // Parse signature header
  const parts = {};
  signature.split(',').forEach(part => {
    const [key, value] = part.split('=');
    parts[key] = value;
  });

  if (!parts.t || !parts.v1) {
    return false;
  }

  const timestamp = parseInt(parts.t, 10);
  const expectedSignature = parts.v1;

  // Verify timestamp within 5 minutes
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return false;
  }

  // Compute signature
  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(expectedSignature)
  );
}

// Usage (Express.js)
app.post('/webhooks/vector', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-vector-signature'];
  const secret = process.env.VECTOR_WEBHOOK_SECRET;

  if (!verifyWebhookSignature(req.body.toString(), signature, secret)) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  // Process event
  res.status(200).send('OK');
});
```

## Python Example

```python
import hmac
import hashlib
import time

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    # Parse signature header
    parts = dict(part.split('=') for part in signature.split(','))

    if 't' not in parts or 'v1' not in parts:
        return False

    timestamp = int(parts['t'])
    expected_signature = parts['v1']

    # Verify timestamp within 5 minutes
    if abs(time.time() - timestamp) > 300:
        return False

    # Compute signature
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
    computed_signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison
    return hmac.compare_digest(computed_signature, expected_signature)

# Usage (Flask)
from flask import request, abort

@app.route('/webhooks/vector', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Vector-Signature', '')
    secret = os.environ['VECTOR_WEBHOOK_SECRET']

    if not verify_webhook_signature(request.data, signature, secret):
        abort(401, 'Invalid signature')

    event = request.json
    # Process event
    return '', 200
```

## Rotate Webhook Secret

If your secret is compromised:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/webhooks/{id}/rotate-secret" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

The old secret is invalidated immediately. Update your application before rotating.

## Next Steps

- [Webhook Retry Behavior](/docs/vector-pro/webhooks/webhook-retries/) - Understand retry logic
- [Webhook Events](/docs/vector-pro/webhooks/webhook-events/) - Event type reference
- [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/) - Getting started
