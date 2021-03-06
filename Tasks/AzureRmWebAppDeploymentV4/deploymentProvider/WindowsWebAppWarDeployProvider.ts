import { AzureRmWebAppDeploymentProvider } from './AzureRmWebAppDeploymentProvider';
import tl = require('vsts-task-lib/task');
import { FileTransformsUtility } from '../operations/FileTransformsUtility';
import * as Constant from '../operations/Constants';
import { DeploymentType } from '../operations/TaskParameters';
import { PackageType } from 'webdeployment-common/packageUtility';
const runFromZipAppSetting: string = '-WEBSITE_RUN_FROM_ZIP 1';
var webCommonUtility = require('webdeployment-common/utility.js');


export class WindowsWebAppWarDeployProvider extends AzureRmWebAppDeploymentProvider{
    
    private zipDeploymentID: string;

    public async DeployWebAppStep() {

        tl.debug("Initiated deployment via kudu service for webapp war package : "+ this.taskParams.Package.getPath());
        var warName = webCommonUtility.getFileNameFromPath(this.taskParams.Package.getPath(), ".war");

        this.zipDeploymentID = await this.kuduServiceUtility.deployUsingWarDeploy(this.taskParams.Package.getPath(), 
            { slotName: this.appService.getSlot() }, warName);

        await this.PostDeploymentStep();
    }
    
    public async UpdateDeploymentStatus(isDeploymentSuccess: boolean) {
        if(this.kuduServiceUtility) {
            await super.UpdateDeploymentStatus(isDeploymentSuccess);
            if(this.zipDeploymentID && this.activeDeploymentID && isDeploymentSuccess) {
                await this.kuduServiceUtility.postZipDeployOperation(this.zipDeploymentID, this.activeDeploymentID);
            }
        }
    }
}
