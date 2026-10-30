import { handleSignPhysicianAgreementRequest } from '../server/signPhysicianAgreementHandler';
import { invokeWebHandler, type NodeApiRequest, type NodeApiResponse } from '../server/nodeWebHandler';

export const config = {
  maxDuration: 20,
};

export default function handler(req: NodeApiRequest, res: NodeApiResponse) {
  return invokeWebHandler(req, res, handleSignPhysicianAgreementRequest);
}
