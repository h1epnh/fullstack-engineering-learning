import type { ComponentType } from 'react';
import Architecture from './Architecture';
import BizComingSoon from './biz/BizComingSoon';
import BizFamilySavings from './biz/BizFamilySavings';
import BizFundSpending from './biz/BizFundSpending';
import BizLimits from './biz/BizLimits';
import BizOverview from './biz/BizOverview';
import BizSocialPayments from './biz/BizSocialPayments';
import BizTransferPayments from './biz/BizTransferPayments';
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

/**
 * id -> page component, for BOTH spaces (Developer + Business, issue #17). Every id here must also
 * appear in src/nav.ts's DEV_NAV_GROUPS or BIZ_NAV_GROUPS (and vice versa). One flat registry on
 * purpose (see nav.ts's top comment for the architecture decision) — ids never collide because
 * every Business id is prefixed `biz-`.
 */
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
  'biz-overview': BizOverview,
  'biz-limits': BizLimits,
  'biz-transfer-payments': BizTransferPayments,
  'biz-social-payments': BizSocialPayments,
  'biz-family-savings': BizFamilySavings,
  'biz-fund-spending': BizFundSpending,
  'biz-coming-soon': BizComingSoon,
};
