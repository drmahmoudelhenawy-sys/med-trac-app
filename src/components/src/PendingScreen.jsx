import React from "react";
import { signOut } from "firebase/auth";
import { auth, t, Icons } from "../App"; // استيراد الـ Constants والـ Firebase

const PendingScreen = ({ lang, dark, txt }) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        dark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <div
        className={`p-8 rounded-2xl shadow-lg w-full max-w-md border text-center ${
          dark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-100 text-slate-800"
        }`}
      >
        <div className="inline-flex p-3 bg-yellow-500 text-white rounded-xl mb-3">
          <Icons.Activity className="w-6 h-6"/>
        </div>
        <h1 className="text-2xl font-bold mb-4">{txt.pending}</h1>
        <p className="mb-6">{txt.pendingAccount}</p>
        <button
          onClick={() => signOut(auth)}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
        >
          {txt.logout}
        </button>
      </div>
    </div>
  );
};

export default PendingScreen;


---
### **الخطوة 7: ملف `src/components/Sidebar.jsx`**

**الرجاء نسخ هذا الكود في المسار `src/components/Sidebar.jsx`**:

```javascript
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth, Icons } from '../App'; // استيراد الـ Constants والـ Firebase

export const Sidebar = ({ lang, dark, role, setScreen, txt }) => {
  const getRoleText = (r) => {
    if (r === "admin") return txt.adminRole;
    if (r === "doctor") return txt.doctorRole;
    return txt.pendingRole;
  };

  const navItems = [
    {
      label: txt.activePatients,
      screen: "dashboard",
      icon: Icons.Users,
      show: role === "doctor" || role === "admin",
    },
    {
      label: txt.adminDashboard,
      screen: "admin",
      icon: Icons.UserPlus,
      show: role === "admin",
    },
  ].filter((item) => item.show);

  return (
    <div
      className={`h-screen w-64 flex-shrink-0 p-4 border-r transition-colors duration-300 hidden md:flex flex-col ${
        dark
          ? "bg-slate-800 border-slate-700 text-white"
          : "bg-white border-gray-200 text-slate-800"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center space-x-2 pb-4 border-b border-dashed mb-6">
        <div className="inline-flex p-2 bg-blue-600 text-white rounded-lg">
          <Icons.Activity className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">{txt.appTitle}</h2>
      </div>

      <p className={`mb-4 text-sm font-semibold ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
        {lang === 'ar' ? "دورك:" : "Your Role:"} {getRoleText(role)}
      </p>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
              dark
                ? "text-slate-200 hover:bg-slate-700"
                : "text-slate-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className={lang === "ar" ? "mr-3" : "ml-3"}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-dashed">
        <button
          onClick={() => signOut(auth)}
          className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
            dark
              ? "text-red-400 hover:bg-slate-700"
              : "text-red-600 hover:bg-red-50"
          }`}
        >
          <Icons.LogOut className="w-5 h-5" />
          <span className={lang === "ar" ? "mr-3" : "ml-3"}>{txt.logout}</span>
        </button>
      </div>
    </div>
  );
};


**عندما تنتهي من نسخ هذين الملفين (الخطوتين 6 و 7)، يرجى عمل Commit & Sync لرفع جميع التعديلات النهائية مرة واحدة.**