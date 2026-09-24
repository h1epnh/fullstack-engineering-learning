import type { ComponentType } from 'react';
import Architecture from './Architecture';
import Conventions from './Conventions';
import DeployK8s from './DeployK8s';
import FrontendDesign from './FrontendDesign';
import MomoSpec from './MomoSpec';
import Overview from './Overview';
import PartnerBank from './PartnerBank';
import Roadmap from './Roadmap';
import SvcTopup from './SvcTopup';
import SvcUser from './SvcUser';
import SvcWallet from './SvcWallet';
import TopupFlow from './TopupFlow';
import WebClient from './WebClient';

/** id -> page component. Every id here must also appear in src/nav.ts (and vice versa). */
export const PAGES: Record<string, ComponentType> = {
  overview: Overview,
  conventions: Conventions,
  architecture: Architecture,
  'topup-flow': TopupFlow,
  'svc-user': SvcUser,
  'svc-wallet': SvcWallet,
  'svc-topup': SvcTopup,
  'partner-bank': PartnerBank,
  'momo-spec': MomoSpec,
  'web-client': WebClient,
  'frontend-design': FrontendDesign,
  'deploy-k8s': DeployK8s,
  roadmap: Roadmap,
};
