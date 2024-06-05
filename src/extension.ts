// let installEventListener: vscode.Disposable | undefined;

// export function activate(context: vscode.ExtensionContext) {
//   // Subscribe to package installation events
//   installEventListener = vscode.extensions.onDidInstallExtension((e) => {
//     installTypeDefinitions(e);
//   });

//   context.subscriptions.push(installEventListener);
// }

// async function installTypeDefinitions(extension: vscode.Extension<any>) {
//   const packageName = extension.packageJSON.name;
//   const hasTypes = await checkForTypeDefinitions(packageName);
//   if (hasTypes) {
//     vscode.window.showInformationMessage(
//       `Type definitions found for ${packageName}. Installing...`
//     );
//     // Run npm install --save-dev @types/package-name
//     cp.exec(
//       `npm install --save-dev @types/${packageName}`,
//       (err, stdout, stderr) => {
//         if (err) {
//           vscode.window.showErrorMessage(
//             `Failed to install type definitions for ${packageName}: ${err.message}`
//           );
//         } else {
//           vscode.window.showInformationMessage(
//             `Type definitions for ${packageName} installed successfully.`
//           );
//         }
//       }
//     );
//   }
// }

// import * as vscode from "vscode";
// import * as request from "request";

// async function checkForTypeDefinitions(packageName: string): Promise<boolean> {
//   return new Promise<boolean>((resolve, reject) => {
//     const url = `https://registry.npmjs.org/@types/${packageName}`;

//     // Send HTTP GET request to npm registry
//     request.get(url, (error, response, body) => {
//       if (error) {
//         // Handle network errors
//         vscode.window.showErrorMessage(
//           `Failed to check for type definitions for ${packageName}: ${error.message}`
//         );
//         reject(error);
//       } else {
//         if (response.statusCode === 200) {
//           // Type definitions exist
//           resolve(true);
//         } else if (response.statusCode === 404) {
//           // Type definitions do not exist
//           resolve(false);
//         } else {
//           // Handle unexpected status codes
//           vscode.window.showErrorMessage(
//             `Unexpected status code ${response.statusCode} while checking for type definitions for ${packageName}`
//           );
//           reject(`Unexpected status code ${response.statusCode}`);
//         }
//       }
//     });
//   });
// }

// export function deactivate() {
//   // Cleanup tasks when the extension is deactivated
//   if (installEventListener) {
//     installEventListener.dispose();
//   }
//   // Add any other cleanup tasks here, such as closing resources or unsubscribing from other event listeners
// }

// import * as vscode from "vscode";
// import axios from "axios";
// import * as cp from "child_process";

// let installEventListener: vscode.Disposable | undefined;

// export function activate(context: vscode.ExtensionContext) {
//   // Subscribe to package installation events
//   installEventListener = vscode.extensions.onDidChangeExtensions(() => {
//     const installedExtensions = vscode.extensions.all.filter(
//       (extension) => extension.isActive && !extension.packageJSON.isBuiltin
//     );

//     installedExtensions.forEach((extension) => {
//       if (extension.packageJSON.isUnpacked) {
//         installTypeDefinitions(extension);
//       }
//     });
//   });

//   context.subscriptions.push(installEventListener);
// }

// async function installTypeDefinitions(extension: vscode.Extension<any>) {
//   const packageName = extension.packageJSON.name;
//   if (!packageName) {
//     vscode.window.showWarningMessage("Package name is undefined.");
//     return;
//   }

//   const hasTypes = await checkForTypeDefinitions(packageName);
//   if (hasTypes) {
//     vscode.window.showInformationMessage(
//       `Type definitions found for ${packageName}. Installing...`
//     );
//     // Run npm install --save-dev @types/package-name
//     cp.exec(
//       `npm install --save-dev @types/${packageName}`,
//       (err, stdout, stderr) => {
//         if (err) {
//           vscode.window.showErrorMessage(
//             `Failed to install type definitions for ${packageName}: ${err.message}`
//           );
//         } else {
//           vscode.window.showInformationMessage(
//             `Type definitions for ${packageName} installed successfully.`
//           );
//         }
//       }
//     );
//   }
// }

// async function checkForTypeDefinitions(packageName: string): Promise<boolean> {
//   const url = `https://registry.npmjs.org/@types/${packageName}`;

//   try {
//     const response = await axios.get(url);
//     if (response.status === 200) {
//       return true;
//     } else if (response.status === 404) {
//       return false;
//     } else {
//       vscode.window.showErrorMessage(
//         `Unexpected status code ${response.status} while checking for type definitions for ${packageName}`
//       );
//       return false;
//     }
//   } catch (error) {
//     if(error instanceof Error){
// 		vscode.window.showErrorMessage(
//       `Failed to check for type definitions for ${packageName}: ${error.message}`
//     );
// 	}
//     return false;
//   }
// }

// export function deactivate() {
//   // Cleanup tasks when the extension is deactivated
//   if (installEventListener) {
//     installEventListener.dispose();
//   }
//   // Add any other cleanup tasks here, such as closing resources or unsubscribing from other event listeners
// }

import * as vscode from "vscode";
import * as cp from "child_process";
import * as axios from "axios";

let installedExtensions: vscode.Extension<any>[] = [];

export function activate(context: vscode.ExtensionContext) {
  // Initial check for installed extensions
  installedExtensions = vscode.extensions.all.filter(
    (extension) => extension.isActive && !extension.packageJSON.isBuiltin
  );

  // Schedule periodic check for new extensions
  setInterval(checkForNewExtensions, 60000); // Check every 60 seconds
}

async function checkForNewExtensions() {
  const currentExtensions = vscode.extensions.all.filter(
    (extension) => extension.isActive && !extension.packageJSON.isBuiltin
  );

  // Compare the current list of extensions to the stored list
  const newExtensions = currentExtensions.filter(
    (extension) => !installedExtensions.some((ext) => ext.id === extension.id)
  );

  // Update the stored list of installed extensions
  installedExtensions = currentExtensions;

  // Install type definitions for new extensions
  newExtensions.forEach((extension) => {
    installTypeDefinitions(extension);
  });
}

async function installTypeDefinitions(extension: vscode.Extension<any>) {
  const packageName = extension.packageJSON.name;
  if (!packageName) {
    vscode.window.showWarningMessage("Package name is undefined.");
    return;
  }

  const hasTypes = await checkForTypeDefinitions(packageName);
  if (hasTypes) {
    vscode.window.showInformationMessage(
      `Type definitions found for ${packageName}. Installing...`
    );
    // Run npm install --save-dev @types/package-name
    cp.exec(
      `npm install --save-dev @types/${packageName}`,
      (err, stdout, stderr) => {
        if (err) {
          vscode.window.showErrorMessage(
            `Failed to install type definitions for ${packageName}: ${err.message}`
          );
        } else {
          vscode.window.showInformationMessage(
            `Type definitions for ${packageName} installed successfully.`
          );
        }
      }
    );
  }
}

async function checkForTypeDefinitions(packageName: string): Promise<boolean> {
  const url = `https://registry.npmjs.org/@types/${packageName}`;

  try {
    const response = await axios.default.get(url);
    if (response.status === 200) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      vscode.window.showErrorMessage(
        `Unexpected status code ${response.status} while checking for type definitions for ${packageName}`
      );
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Failed to check for type definitions for ${packageName}: ${error.message}`
      );
    }
    return false;
  }
}
let installEventListener: vscode.Disposable | undefined;
let extensionCheckInterval: NodeJS.Timeout | undefined;

export function deactivate() {
  // Cleanup tasks when the extension is deactivated

  // Stop the periodic check for new extensions if it was started
  clearInterval(extensionCheckInterval);

  // Dispose of any event listeners or other disposables
  if (installEventListener) {
    installEventListener.dispose();
  }
}
