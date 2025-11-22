import React, { useState, useEffect, useMemo, useRef } from "react";
import { onSnapshot, query, updateDoc, deleteDoc, collection, doc, setDoc, orderBy, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db, t, Icons } from "../App";
import PatientDetails from "./PatientDetails"; // استيراد صفحة التفاصيل

// --- 2.2: نموذج إضافة مريض (Patient Add Form) ---
const PatientAddForm = ({ patientsColRef, lang, dark, txt }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [riskFactors, setRiskFactors] = useState({});
    const formRef = useRef(null);

    const RISKS = ['hypertension', 'diabetes', 'af', 'ischemicHeart', 'pastStroke', 'regularOnTtt', 'renal', 'hepatic', 'smoker', 'addict'];
    
    const handleRiskChange = (key) => {
        setRiskFactors(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const patientId = `P-${Date.now().toString().slice(-6)}`;
        
        try {
            const formData = new FormData(formRef.current);

            // جمع بيانات الفحص
            const examinationData = {};
            ['bp', 'rbs', 'ipp', 'consciousLevel'].forEach(key => {
                examinationData[key] = formData.get(key) || '';
            });

            await setDoc(doc(patientsColRef, patientId), {
                id: patientId,
                name: name,
                age: age,
                createdAt: serverTimestamp(),
                
                // Personal History
                presentation: formData.get('presentation') || '',
                riskFactors: riskFactors,
                
                // Examination 
                examination: examinationData,
                
                // Investigations (Initial empty state)
                investigations: {
                    laboratory: [], 
                    imaging: [],
                },
            });

            // إعادة ضبط الحقول
            setName('');
            setAge('');
            setRiskFactors({});
            formRef.current.reset();
            alert(txt.addPatient + ' ' + (lang === 'ar' ? 'بنجاح!' : 'Successful!'));
        } catch (e) {
            console.error("Error adding patient:", e);
            alert("حدث خطأ أثناء إضافة المريض.");
        }
    };

    const Input = ({ name, placeholder, value, onChange, type='text', required=true }) => (
        <input
            name={name}
            type={type}
            className={`w-full p-3 border rounded-lg outline-none ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50"}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
        />
    );
    
    const Divider = ({ title }) => (
        <h3 className={`text-lg font-bold pt-4 pb-2 border-b mt-6 ${dark ? 'border-slate-700 text-blue-400' : 'border-gray-200 text-blue-600'}`}>{title}</h3>
    );


    return (
        <form ref={formRef} onSubmit={handleSubmit} className={`mb-6 p-6 rounded-2xl shadow-lg space-y-4 ${dark ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{txt.addPatient}</h2>
            
            {/* Name & Age */}
            <div className="grid grid-cols-2 gap-4">
                <Input name="name" placeholder={txt.patientName} value={name} onChange={(e) => setName(e.target.value)} />
                <Input name="age" placeholder={txt.age} type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            {/* --- 1. PERSONAL HISTORY --- */}
            <Divider title={txt.personalHistory} />
            
            {/* Presentation */}
            <textarea
                name="presentation"
                rows="3"
                className={`w-full p-3 border rounded-lg outline-none ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50"}`}
                placeholder={txt.presentation}
                required
            ></textarea>
            
            {/* Risk Factors Checkboxes */}
            <h4 className={`text-sm font-semibold mt-4 ${dark ? 'text-slate-300' : 'text-gray-600'}`}>{txt.riskFactors}:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 rounded-lg border border-dashed">
                {RISKS.map(key => (
                    <label key={key} className={`flex items-center space-x-2 cursor-pointer ${dark ? 'text-slate-300' : 'text-slate-700'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        <input
                            type="checkbox"
                            checked={riskFactors[key] || false}
                            onChange={() => handleRiskChange(key)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{txt[key]}</span>
                    </label>
                ))}
            </div>

            {/* --- 2. EXAMINATION --- */}
            <Divider title={txt.examination} />
            <div className="grid grid-cols-2 gap-4">
                <Input name="bp" placeholder={txt.bp} required={false} />
                <Input name="rbs" placeholder={txt.rbs} required={false} />
                <Input name="ipp" placeholder={txt.ipp} required={false} />
                <Input name="consciousLevel" placeholder={txt.consciousLevel} required={false} />
            </div>
            
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-6"
            >
                {txt.addPatient}
            </button>
        </form>
    );
};


const DoctorsDashboard = ({ lang, dark, userId, txt, appId }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patientsColRef = useMemo(
    () => collection(db, `artifacts/${appId}/users/${userId}/patients`),
    [userId]
  );

  useEffect(() => {
    const q = query(patientsColRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientList);
        setLoading(false);
      },
      (error) => {
        console.error("Error reading patients:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [patientsColRef]);

  const handleDeletePatient = async (id) => {
    if(window.confirm(txt.confirmDelete)) {
        try {
            await deleteDoc(doc(patientsColRef, id));
            setSelectedPatient(null);
        } catch(e) {
            alert(lang === 'ar' ? "حدث خطأ أثناء الحذف." : "Deletion error.");
        }
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase())
  );
  
  if (selectedPatient) {
    return (
      <PatientDetails 
        patient={selectedPatient} 
        onBack={() => setSelectedPatient(null)} 
        onDelete={handleDeletePatient}
        patientsColRef={patientsColRef}
        lang={lang}
        dark={dark}
        txt={txt}
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.activePatients}
      </h1>
      <PatientAddForm patientsColRef={patientsColRef} lang={lang} dark={dark} txt={txt}/>

      <div className={`mb-6 relative ${dark ? "text-white" : "text-slate-800"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
        <input
          className={`w-full p-3 border rounded-lg outline-none ${
            dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
          } ${lang === "ar" ? "pr-10" : "pl-10"}`}
          placeholder={txt.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Icons.Search
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${
            lang === "ar" ? "right-3" : "left-3"
          } ${dark ? "text-slate-400" : "text-gray-500"}`}
        />
      </div>

      {loading ? (
        <p className={dark ? "text-slate-400" : "text-gray-600"}>
          {lang === "ar" ? "جاري تحميل المرضى..." : "Loading patients..."}
        </p>
      ) : filteredPatients.length === 0 ? (
        <div
          className={`p-6 rounded-xl border-2 border-dashed ${
            dark
              ? "border-slate-700 text-slate-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          {txt.noPatients}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow ${
                dark ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div>
                <p className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>{patient.name}</p>
                <p className={`text-sm ${dark ? "text-slate-400" : "text-gray-500"}`}>
                  {patient.id}
                </p>
              </div>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors"
              >
                {lang === "ar" ? "عرض السجل" : "View Record"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsDashboard;


---
**عندما تنتهي من نسخ ملف `PatientsDashboard.jsx`، أخبرني لننتقل إلى الخطوة 5 (ملف `PatientDetails.jsx`).**