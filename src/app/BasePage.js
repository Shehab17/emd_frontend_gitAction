import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ContentRoute, LayoutSplashScreen } from "../_metronic/layout";
import BillAmendmentCreate from "./pages/BillAmendmentCreate";
import BillCreate from "./pages/BillCreate";
import BillCreateThirdParty from "./pages/BillCreateThirdParty";
import BillDetails from "./pages/BillDetails";
import BillingParameter from "./pages/BillingParameter";
import BillingPolicy from "./pages/BillingPolicy";
import BillingPolicyDetails from "./pages/BillingPolicyDetails";
import BillingPolicyEdit from "./pages/BillingPolicyEdit";
import BillingPolicyList from "./pages/BillingPolicyList";
import BillList from "./pages/BillList";
import { BuilderPage } from "./pages/BuilderPage";
import { DashboardPage } from "./pages/DashboardPage";
import DayWiseLogBook from "./pages/DayWiseLogBook";
import Emo from "./pages/Emo";
import EmoDetails from "./pages/EmoDetails";
import EmoEdit from "./pages/EmoEdit";
import EmoList from "./pages/EmoList";
import EmoParking from "./pages/EmoParking";
import EmoReceive from "./pages/EmoReceive";
import EmoReceiveEdit from "./pages/EmoReceiveEdit";
import Equipment from "./pages/Equipment";
import EquipmentAssign from "./pages/EquipmentAssign";
import EquipmentDetails from "./pages/EquipmentDetails";
import EquipmentEdit from "./pages/EquipmentEdit";
import EquipmentEmi from "./pages/EquipmentEmi";
import EquipmentEmiSetupList from "./pages/EquipmentEmiSetupList";
import EquipmentList from "./pages/EquipmentList";
import EquipmentOpeningRunningHour from "./pages/EquipmentOpeningRunningHour";
import EquipmentRelease from "./pages/EquipmentRelease";
import EquipmentReleaseDetails from "./pages/EquipmentReleaseDetails";
import EquipmentReleaseEdit from "./pages/EquipmentReleaseEdit";
import EquipmentReleaseList from "./pages/EquipmentReleaseList";
import EquipmentRentRate from "./pages/EquipmentRentRate";
import EquipmentScheduleList from "./pages/EquipmentScheduleList";
import EquipmentScheduleMaintenanceCreate from "./pages/EquipmentScheduleMaintenanceCreate";
import EquipmentWiseLogBook from "./pages/EquipmentWiseLogBook";
import FuelType from "./pages/FuelType";
import InterestRate from "./pages/InterestRate";
import LogBookDetails from "./pages/LogBookDetails";
import LogBookFuel from "./pages/LogBookFuel";
import LogBookFuelList from "./pages/LogBookFuelList";
import LogBookImport from "./pages/LogBookImport";
import LogBookList from "./pages/LogBookList";
import LogBookOperator from "./pages/LogBookOperator";
import LogBookSiteEngineer from "./pages/LogBookSiteEngineer";
import MaintenanceOrderConfirmation from "./pages/MaintenanceOrderConfirmation";
import MaintenanceOrderCreate from "./pages/MaintenanceOrderCreate";
import MaintenanceOrderDetails from "./pages/MaintenanceOrderDetails";
import MaintenanceOrderEdit from "./pages/MaintenanceOrderEdit";
import MaintenanceOrderListOngoing from "./pages/MaintenanceOrderListOngoing";
import MaintenanceOrderListCompleted from "./pages/MaintenanceOrderListCompleted";
import MaintenanceTeam from "./pages/MaintenanceTeam";
import Make from "./pages/Make";
import Manufacturer from "./pages/Manufacturer";
import CreatePage from "./pages/PageCreate";
import EditPage from "./pages/PageEdit";
import PageManagement from "./pages/PageManagement";
import ProjectBillingPolicy from "./pages/ProjectBillingPolicy";
import ProjectLocation from "./pages/ProjectLocation";
import ReceiveEmoList from "./pages/ReceiveEmoList";
import BillingEquipmentWiseReport from "./pages/reports/BillingEquipmentWiseReport";
import BillingProjectWiseReport from "./pages/reports/BillingProjectWiseReport";
import EmoDetailsReport from "./pages/reports/EmoDetailsReport";
import ReleaseDetailsReport from "./pages/reports/ReleaseDetailsReport";
import UtilizationReport from "./pages/reports/UtilizationReport";
import RoleManagement from "./pages/RoleManagement";
import ScheduleMaintenancePlanCreate from "./pages/ScheduleMaintenancePlanCreate";
import ScheduleMaintenancePlanDetails from "./pages/ScheduleMaintenancePlanDetails";
import ScheduleMaintenancePlanList from "./pages/ScheduleMaintenancePlanList";
import SitePerson from "./pages/SitePerson";
import ThirdPartyEmo from "./pages/ThirdPartyEmo";
import UserRolePermission from "./pages/UserRolePermission";
import ToDoList from "./pages/ToDoList";

const GoogleMaterialPage = lazy(() =>
  import("./modules/GoogleMaterialExamples/GoogleMaterialPage")
);
const ReactBootstrapPage = lazy(() =>
  import("./modules/ReactBootstrapExamples/ReactBootstrapPage")
);


export default function BasePage() {
  // useEffect(() => {
  //   console.log('Base page');
  // }, []) // [] - is required if you need only one call
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        <ContentRoute path="/dashboard" component={DashboardPage} />
        <ContentRoute path="/builder" component={BuilderPage} />
        <ContentRoute path="/equipment-create" component={Equipment} />
        <ContentRoute path="/equipment-emi-setup" component={EquipmentEmi} />
        <ContentRoute path="/equipment-emi-list" component={EquipmentEmiSetupList} />
        <ContentRoute path="/equipment-rentrate-setup" component={EquipmentRentRate} />
        <ContentRoute path="/equipment-assign"  component={EquipmentAssign} />
        <ContentRoute path="/billingsetup-parameter" component={BillingParameter} />
        <ContentRoute path="/setup-manufacturer" component={Manufacturer} />
        <ContentRoute path="/setup-site-person" component={SitePerson} />
        <ContentRoute path="/setup-interestRate" component={InterestRate} />
        <ContentRoute path="/billingsetup-billingpolicy" component={BillingPolicy} />
        <ContentRoute path="/billingsetup-policy-details/:id" component={BillingPolicyDetails} />
        <ContentRoute path="/billingsetup-list-billingpolicy" component={BillingPolicyList} />
        <ContentRoute path="/billingsetup-billingpolicy-edit/:id" component={BillingPolicyEdit} />
        <ContentRoute path="/equipment-list" component={EquipmentList} />
        <ContentRoute path="/equipment-details/:id" component={EquipmentDetails} />
        <ContentRoute path="/emo-create" component={Emo} />
        <ContentRoute path="/emo-list" component={EmoList} />
        <ContentRoute path="/emo-details/:id" component={EmoDetails} />
        <ContentRoute path="/release-equipment" component={EquipmentRelease} />
        <ContentRoute path="/release-list-equipment" component={EquipmentReleaseList} />
        <ContentRoute path="/release-equipment-details/:id" component={EquipmentReleaseDetails} />
        <ContentRoute path="/emo-receive/:id" component={EmoReceive} />
        <ContentRoute path="/emo-receive" component={EmoReceive} />
        <ContentRoute path="/emo-rceive-list" component={ReceiveEmoList} />
        <ContentRoute path="/generate-bill-create" component={BillCreate} />
        <ContentRoute path="/generate-bill-third-party" component={BillCreateThirdParty} />
        <ContentRoute path="/generate-bill-list" component={BillList} />
        <ContentRoute path="/generate-bill-details/:id" component={BillDetails} />
        <ContentRoute path="/setup-make" component={Make} />
        <ContentRoute path="/accesscontrol-rolemanagement" component={RoleManagement} />
        <ContentRoute path="/accesscontrol-pagemanagement" component={PageManagement} />
        <ContentRoute path="/accesscontrol-createpage" component={CreatePage} />
        <ContentRoute path="/accesscontrol-editpage/:id" component={EditPage} />
        <ContentRoute path="/accesscontrol-userrolepermission" component={UserRolePermission} />
        <ContentRoute path="/equipment-edit/:id" component={EquipmentEdit} />
        <ContentRoute path="/emo-third-party" component={ThirdPartyEmo} />
        <ContentRoute path="/setup-fuel-type" component={FuelType} />
        <ContentRoute path="/maintenance-order-create" component={MaintenanceOrderCreate} />
        <ContentRoute path="/maintenance-order-list-ongoing" component={MaintenanceOrderListOngoing} />
        <ContentRoute path="/maintenance-order-list-completed" component={MaintenanceOrderListCompleted} />
        <ContentRoute path="/maintenance-order-details/:id" component={MaintenanceOrderDetails} />
        <ContentRoute path="/setup-maintenance-team" component={MaintenanceTeam} />
        <ContentRoute path='/maintenance-order-confirmation' component={MaintenanceOrderConfirmation} />
        <ContentRoute path='/maintenance-order-complete/:orderId' component={MaintenanceOrderConfirmation} />
        <ContentRoute path='/log-book-operator' component={LogBookOperator} />
        <ContentRoute path='/log-book-fuel' component={LogBookFuel} />
        <ContentRoute path='/setup-project-location' component={ProjectLocation} />
        <ContentRoute path='/log-book-site-engineer' component={LogBookSiteEngineer} />
        <ContentRoute path='/log-book-day-wise' component={DayWiseLogBook} />
        <ContentRoute path='/log-book-equipment-wise' component={EquipmentWiseLogBook} />
        <ContentRoute path='/log-book-list-fuel' component={LogBookFuelList} />
        <ContentRoute path="/billingsetup-project-billingpolicy" component={ProjectBillingPolicy} />
        <ContentRoute path='/maintenance-order-edit/:orderId' component={MaintenanceOrderEdit} />
        <ContentRoute path="/schedule-maintenance-plan-create" component={ScheduleMaintenancePlanCreate} />
        <ContentRoute path="/schedule-maintenance-plan-list" component={ScheduleMaintenancePlanList} />
        <ContentRoute path="/schedule-maintenance-plan-details/:schedulePlanId" component={ScheduleMaintenancePlanDetails} />
        <ContentRoute path="/reports-emo-details" component={EmoDetailsReport} />
        <ContentRoute path="/reports-release-details" component={ReleaseDetailsReport} />
        <ContentRoute path="/reports/billing-projectwise"  component={BillingProjectWiseReport} />
        <ContentRoute path="/reports/billing-equipmentwise"  component={BillingEquipmentWiseReport} />
        <ContentRoute path="/equipment-opening-running-hour" component={EquipmentOpeningRunningHour} />
        <ContentRoute path="/schedule-maintenance-create" component={EquipmentScheduleList} />
        <ContentRoute path='/schedule-maintenance-order-create/:scheduleMaintId' component={EquipmentScheduleMaintenanceCreate} />
        <ContentRoute path='/emo-edit/:emoId' component={EmoEdit} />
        <ContentRoute path='/emo-receive-edit/:emoId' component={EmoReceiveEdit} />
        <ContentRoute path='/release-equipment-edit/:id' component={EquipmentReleaseEdit} />
        <ContentRoute path="/emo-parking" component={EmoParking} />
        <ContentRoute path="/log-book-import" component={LogBookImport} />
        <ContentRoute path="/log-book-list" component={LogBookList} />
        <ContentRoute path='/log-book-details/:logEntryTrackId' component={LogBookDetails} />
        <ContentRoute path="/reports/utilization-report" component={UtilizationReport} />
        <ContentRoute path="/generate-bill-amendment" component={BillAmendmentCreate} />
        <ContentRoute path="/to-do-list" component={ToDoList} />
        <Route path="/google-material" component={GoogleMaterialPage} />
        <Route path="/react-bootstrap" component={ReactBootstrapPage} />
        <Redirect to="error/error-v1" />
      </Switch>
    </Suspense>
  );
}
