import type { AccessTokenPayload } from '../modules/auth/utils/token.js';

/**
 * ============================================================================
 * TypeScript Declaration Merging (Type Augmentation)
 * ============================================================================
 * 
 * ❓ AGAR YEH FILE NA HOTI TOH KYA HOTA?
 * ----------------------------------------------------------------------------
 * 1. Express ke standard Request object ('req') ko sirf default properties pata
 *    hoti hain (jaise req.body, req.headers, req.params, req.query).
 * 
 * 2. Express ko nahi pata hota ki 'req.user' naam ki bhi koi property ho sakti hai.
 * 
 * 3. Agar yeh file na hoti, toh jab hum 'authenticate.ts' middleware mein
 *    'req.user = decoded' likhte, toh TypeScript compile error throw karta:
 *    ❌ Error TS2339: Property 'user' does not exist on type 'Request'.
 * 
 * 4. Controllers ke andar 'req.user.userId' ya 'req.user.email' type karne par
 *    koi autocomplete (IntelliSense) aur type-safety nahi milti.
 * 
 * 🎯 YEH FILE KYA KARTI HAI?
 * ----------------------------------------------------------------------------
 * Yeh Express ke global 'Request' interface mein ek optional 'user' field jod deti hai,
 * jiska type hamare JWT payload ('AccessTokenPayload') se match karta hai.
 * Isse pure project ke controllers mein strongly typed 'req.user' milta hai.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
