import React, { useState, useEffect, useMemo, useRef } from "react";
import { onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db, t, Icons } from "../App";

const PatientDetails = ({ patient, onBack, onDelete, patientsColRef, lang, dark, txt }) => {
    const [currentPatient, setCurrentPatient] = useState(patient);
    const [activeTab, setActiveTab] = useState('history');
    const [invType, setInvType] = useState('lab'); // lab or img
    const [inputData, setInputData] = useState({ key: 'cbc', value: '', note: '' });
    const fileRef = useRef(null);

    // تحديث بيانات المريض في الوقت الفعلي
    useEffect(() => {
        const docRef = doc(patientsColRef, patient.id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setCurrentPatient(docSnap.data());
            }
        });
        return () => unsubscribe();
    }, [patient.id, patientsColRef]);
    
    // لغة الإنجليزية للمفاتيح
    const LAB_KEYS = ['cbc', 'creat', 'urea', 'pt', 'na', 'k', 'ca', 'uricAcid', 'hba1c', 'toxo', 'urineAnalysis', 'csf', 'autoimmuneStudies'];
    const IMG_KEYS = ['ct', 'mri', 'ncs', 'eeg', 'emg', 'vep', 'fundusEx'];

    // دالة تحويل الصورة إلى Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (file.size > 800 * 1024) { // 800KB Limit
                reject(new Error(lang === 'ar' ? "حجم الملف يتجاوز 800KB." : "File size exceeds 800KB limit."));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // دالة إضافة سجل جديد (لـ LAB / IMG)
    const handleAddInvestigation = async () => {
        const file = fileRef.current?.files[0];
        let base64Image = '';

        if (file) {
            try {
                base64Image = await fileToBase64(file);
            } catch (e) {
                alert(e.message);
                return;
            }
        }
        
        const newRecord = {
            key: inputData.key,
            value: inputData.value || '',
            note: inputData.note || '',
            image: base64Image,
            date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
            timestamp: serverTimestamp()
        };
        
        const targetType = invType === 'lab' ? 'laboratory' : 'imaging';

        try {
            const docRef = doc(patientsColRef, currentPatient.id);
            await updateDoc(docRef, {
                [`investigations.${targetType}`]: arrayUnion(newRecord)
            });
            
            // إعادة ضبط الحقول
            setInputData({ key: inputData.key, value: '', note: '' });
            if (fileRef.current) fileRef.current.value = '';
            alert(lang === 'ar' ? 'تم إضافة السجل بنجاح!' : 'Record added successfully!');
            
        } catch (e) {
            console.error("Error adding investigation:", e);
            alert(lang === 'ar' ? 'حدث خطأ أثناء إضافة السجل.' : 'Error adding record.');
        }
    };
    
    // دالة عرض سجلات التحاليل/الأشعة
    const renderRecords = (data) => {
        if (!data || data.length === 0) {
            return <p className={`p-4 text-center ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{txt.noRecords}</p>;
        }
        
        return (
            <div className="space-y-4">
                {data.slice().sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds || 0).map((record, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${dark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-lg text-blue-500">{txt[record.key]}</span>
                            <span className="text-xs text-gray-500">{record.date}</span>
                        </div>
                        {record.value && <p className="mb-2"><strong>{txt.value}:</strong> {record.value}</p>}
                        {record.note && <p className="mb-2"><strong>{txt.note}:</strong> {record.note}</p>}
                        
                        {record.image && (
                            <div className="mt-3">
                                <strong>{txt.image}:</strong>
                                <img src={record.image} alt={txt[record.key]} className="w-full max-h-60 object-contain rounded-lg border mt-1" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-blue-500 hover:text-blue-700 font-bold">
                    <Icons.Back className={lang === 'ar' ? 'ml-2' : 'mr-2'}/> {lang === 'ar' ? "عودة للمرضى" : "Back to Patients"}
                </button>
                <button onClick={() => onDelete(patient.id)} className="text-red-500 hover:text-red-700">
                    {lang === 'ar' ? "حذف المريض" : "Delete Patient"}
                </button>
            </div>

            <h1 className={`text-4xl font-extrabold ${dark ? 'text-white' : 'text-slate-800'}`}>{currentPatient.name}</h1>
            <p className="text-gray-500 mb-6">{currentPatient.id} • {currentPatient.age} {lang === 'ar' ? 'سنة' : 'Years Old'}</p>

            {/* --- TABS --- */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <button onClick={() => setActiveTab('history')} className={`p-3 rounded-t-lg font-bold transition-colors ${activeTab === 'history' ? (dark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100')}`}>{txt.personalHistory}</button>
                <button onClick={() => setActiveTab('exam')} className={`p-3 rounded-t-lg font-bold transition-colors ${activeTab === 'exam' ? (dark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100')}`}>{txt.examination}</button>
                <button onClick={() => setActiveTab('invest')} className={`p-3 rounded-t-lg font-bold transition-colors ${activeTab === 'invest' ? (dark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100')}`}>{txt.investigations}</button>
            </div>
            
            {/* --- TAB CONTENT --- */}
            <div className={`p-6 rounded-b-xl shadow-lg ${dark ? 'bg-slate-800' : 'bg-white'}`}>

                {/* PERSONAL HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h3 className={`text-xl font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{txt.presentation}</h3>
                        <p className={`p-3 rounded-lg border ${dark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>{currentPatient.presentation || (lang === 'ar' ? 'لا توجد شكوى مسجلة' : 'No presentation recorded')}</p>

                        <h3 className={`text-xl font-bold pt-4 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{txt.riskFactors}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {['hypertension', 'diabetes', 'af', 'ischemicHeart', 'pastStroke', 'regularOnTtt', 'renal', 'hepatic', 'smoker', 'addict'].map(key => (
                                <div key={key} className={`flex items-center space-x-2 ${currentPatient.riskFactors?.[key] ? 'text-green-500 font-bold' : 'text-red-500 opacity-70 line-through'}`} dir="rtl">
                                    {currentPatient.riskFactors?.[key] ? <Icons.Check className="w-5 h-5"/> : <Icons.X className="w-5 h-5"/>}
                                    <span>{txt[key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* EXAMINATION TAB */}
                {activeTab === 'exam' && (
                    <div className="space-y-4">
                        {Object.entries(currentPatient.examination || {}).map(([key, value]) => (
                            <div key={key} className={`p-3 rounded-lg border ${dark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                                <strong className="text-blue-500">{txt[key]}:</strong> {value || (lang === 'ar' ? 'غير مسجل' : 'Not recorded')}
                            </div>
                        ))}
                    </div>
                )}

                {/* INVESTIGATIONS TAB */}
                {activeTab === 'invest' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. ADD NEW INVESTIGATION */}
                        <div className={`lg:col-span-1 p-4 rounded-xl h-fit border ${dark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
                            <h4 className="font-bold mb-3">{lang === 'ar' ? 'إضافة فحص جديد' : 'Add New Test'}</h4>
                            <div className="flex space-x-2 mb-3">
                                <button type="button" onClick={() => setInvType('lab')} className={`flex-1 py-2 rounded-lg font-bold transition-colors ${invType === 'lab' ? 'bg-blue-500 text-white' : (dark ? 'bg-slate-600 text-slate-300' : 'bg-white text-gray-700')}`}>
                                    {lang === 'ar' ? 'تحاليل' : 'Labs'}
                                </button>
                                <button type="button" onClick={() => setInvType('img')} className={`flex-1 py-2 rounded-lg font-bold transition-colors ${invType === 'img' ? 'bg-blue-500 text-white' : (dark ? 'bg-slate-600 text-slate-300' : 'bg-white text-gray-700')}`}>
                                    {lang === 'ar' ? 'أشعة' : 'Imaging'}
                                </button>
                            </div>
                            
                            <select 
                                name="testKey" 
                                onChange={(e) => setInputData({...inputData, key: e.target.value})}
                                value={inputData.key || (invType === 'lab' ? LAB_KEYS[0] : IMG_KEYS[0])}
                                className={`w-full p-2 mb-3 rounded-lg border ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white text-slate-800'}`}
                            >
                                {(invType === 'lab' ? LAB_KEYS : IMG_KEYS).map(key => (
                                    <option key={key} value={key}>{txt[key]}</option>
                                ))}
                            </select>

                            <input 
                                type="text" 
                                placeholder={txt.value} 
                                value={inputData.value}
                                onChange={(e) => setInputData({...inputData, value: e.target.value})}
                                className={`w-full p-2 mb-3 rounded-lg border ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white text-slate-800'}`}
                            />
                            <textarea 
                                placeholder={txt.note} 
                                rows="2"
                                value={inputData.note}
                                onChange={(e) => setInputData({...inputData, note: e.target.value})}
                                className={`w-full p-2 mb-3 rounded-lg border ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white text-slate-800'}`}
                            />

                            <label className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-sm ${dark ? 'bg-slate-600 border-slate-500 hover:bg-slate-500' : 'bg-blue-100 border-blue-200 hover:bg-blue-200'}`}>
                                <Icons.Upload className="w-4 h-4"/> 
                                <span className={lang === 'ar' ? 'mr-2' : 'ml-2'}>{txt.uploadImage}</span>
                                <input type="file" ref={fileRef} className="hidden" accept="image/*" />
                            </label>

                            <button 
                                onClick={handleAddInvestigation}
                                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors mt-3"
                            >
                                {txt.save}
                            </button>
                        </div>
                        
                        {/* 2. RECORDS LIST */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className={`text-xl font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{txt.laboratory}</h3>
                            {renderRecords(currentPatient.investigations?.laboratory)}
                            
                            <h3 className={`text-xl font-bold pt-4 border-t ${dark ? 'text-blue-400 border-slate-700' : 'text-blue-600 border-gray-200'}`}>{txt.imaging}</h3>
                            {renderRecords(currentPatient.investigations?.imaging)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetails;


---
### **الخطوة 6: ملف `src/components/PendingScreen.jsx`**

**الرجاء نسخ هذا الكود في المسار `src/components/PendingScreen.jsx`**:

```javascript
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