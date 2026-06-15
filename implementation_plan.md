# **Implement Loader Dashboard**

This plan outlines the steps required to build a full-featured "Loader Dashboard" based on the new loader backend controllers and routes.

## **Open Questions**

**IMPORTANT**

**Barcode Scanner Integration:** The Loader Dashboard involves heavy use of package scanning (`scan-in` and `scan-out`). Should we implement a real device camera barcode scanner (using HTML5-QRCode which is in your `package.json`), or start with a simple input box where the loader can type/paste the package ID/Tracking Number? I'll build it with a text input box that focuses automatically for physical scanner guns, but let me know if you want the device camera integration immediately!

**NOTE**

The role in `roles.ts` is defined as `SORTER: "loader"`. I will use `ROLES.SORTER` to control visibility of these new features.

## **Proposed Changes**

---

### **API Service Layer**

#### **[MODIFY] LoaderService.ts**

Add frontend API bindings for the new `/freelancer/loader` routes:

- **Shift Management:** `loaderCheckIn`, `loaderCheckOut`, `loaderGetMyShift`, `loaderGetStats`
- **Manifest Management:** `loaderCreateManifest`, `loaderGetManifestDetail`, `loaderScanIn`, `loaderScanOut`, `loaderSealManifest`, `loaderDepartManifest`, `loaderArriveManifest`, etc.

---

### **Navigation & Routing**

#### **[MODIFY] roles.ts**

- Add `ROLES.SORTER` (loader) to the allowed roles for `/dashboard/overview`.
- Create a new route authorization for `/dashboard/manifests`.

#### **[MODIFY] sidebar.tsx**

- Add the "Manifests" navigation item to the sidebar, visible only to Loaders (and optionally Supervisors/Managers).

#### **[MODIFY] overview/page.tsx**

- Route the `LOADER` (SORTER) role to render a new `<LoaderDashboard />` component.

---

### **New Dashboard Views**

#### **[NEW] components/dashboard/LoaderDashboard.tsx**

- **Shift Management Card:** Shows current shift status with big "Check In" / "Check Out" buttons.
- **Stats Overview:** Visual display of packages loaded today, active manifests, and discrepancies.

#### **[NEW] app/dashboard/manifests/page.tsx**

- A table listing all manifests.
- A "Create Manifest" button (opens a modal to pick a destination branch and vehicle/driver).
- Filters for manifest status (pending, loading, in-transit, delivered).

#### **[NEW] app/dashboard/manifests/[id]/page.tsx**

- The core operational view for a single Manifest.
- Includes a scanning interface to scan packages **IN** (at origin) and **OUT** (at destination).
- Action buttons to transition manifest state (Seal -> Load -> Depart -> Arrive -> Close).
- Displays any discrepancies if a package is missing.

## **Verification Plan**

### **Automated Tests**

- TypeScript compilation to ensure all new types match the controllers.

### **Manual Verification**

1. Log in as a user with the `loader` role.
2. Verify the Sidebar only shows allowed navigation (Overview, Manifests).
3. Test checking in and out of a shift from the Overview dashboard.
4. Test creating a new manifest.
5. Open the manifest, input a mock package ID, and verify the package is added to the manifest.



  
