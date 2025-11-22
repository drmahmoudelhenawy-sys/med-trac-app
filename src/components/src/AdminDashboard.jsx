import React, { useState, useEffect } from "react";
import { onSnapshot, query, where, updateDoc, deleteDoc, collection, doc } from "firebase/firestore";
import { db, t, Icons } from "../App"; // استيراد الـ Constants والـ Firebase

const AdminDashboard = ({ lang, dark, userId, setRole, txt, appId }) => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  // مسار الأطباء العام (يحتوي على جميع أدوار الأطباء)
  const doctorsColRef = collection(db, `artifacts/${appId}/public/data/doctors`);

  useEffect(() => {
    // جلب الأطباء المعلقين (Pending) فقط
    const q = query(doctorsColRef, where("role", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const doctors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingDoctors(doctors);
        setLoading(false);
      },
      (error) => {
        console.error("Error reading pending doctors:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleAction = async (docId, action) => {
    try {
      const doctorRef = doc(doctorsColRef, docId);
      if (action === "activate") {
        // تفعيل الحساب وتعيين الدور كـ doctor
        await updateDoc(doctorRef, { role: "doctor" });
        if (docId === userId) setRole("doctor");
      } else if (action === "delete") {
        // حذف مستند الطبيب من Firestore
        await deleteDoc(doctorRef);
      }
      setConfirmModal(null);
    } catch (e) {
      console.error("Error performing action:", e);
      alert("حدث خطأ أثناء تنفيذ الإجراء.");
    }
  };

  const Modal = () => {
    if (!confirmModal) return null;
    const { type, docId, email, seniority, college } = confirmModal;
    const isActivate = type === "activate";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`p-6 rounded-lg shadow-2xl w-full max-w-md ${
            dark ? "bg-slate-700 text-white" : "bg-white text-slate-800"
          }`}
        >
          <h3 className="text-xl font-bold mb-4">
            {isActivate ? txt.confirmActivate : txt.confirmDelete}
          </h3>
          <p className="mb-2">
            {txt.email}: **{email}**
          </p>
          {isActivate && (
            <>
              <p className="mb-2">
                {txt.seniority}: **{txt[seniority] || seniority}**
              </p>
              <p className="mb-6">
                {txt.college}: **{college}**
              </p>
            </>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmModal(null)}
              className="py-2 px-4 rounded-lg border transition-colors"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={() => handleAction(docId, type)}
              className={`py-2 px-4 rounded-lg font-bold transition-colors ${
                isActivate
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isActivate ? txt.activate : txt.delete}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-center p-10">
        {lang === "ar" ? "جاري التحميل..." : "Loading..."}
      </div>
    );

  return (
    <div className="p-4 md:p-8">
      <h1
        className={`text-3xl font-bold mb-6 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        {txt.adminDashboard}
      </h1>
      <h2
        className={`text-xl font-semibold mb-4 ${
          dark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {txt.pendingDoctors} ({pendingDoctors.length})
      </h2>
      {pendingDoctors.length === 0 ? (
        <div
          className={`p-6 rounded-xl border-2 border-dashed ${
            dark
              ? "border-slate-700 text-slate-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          {lang === "ar"
            ? "لا يوجد أطباء جدد بانتظار التفعيل."
            : "No new doctors awaiting activation."}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center ${
                dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"
              }`}
            >
              <div>
                <p className="font-bold">{doctor.email}</p>
                <p className={`text-sm ${dark ? "text-slate-400" : "text-gray-500"}`}>
                  {txt.seniority}: {txt[doctor.seniority] || doctor.seniority} / {txt.college}: {doctor.college}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      type: "activate",
                      docId: doctor.id,
                      email: doctor.email,
                      seniority: doctor.seniority,
                      college: doctor.college,
                    })
                  }
                  className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  title={txt.activate}
                >
                  <Icons.Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({
                      type: "delete",
                      docId: doctor.id,
                      email: doctor.email,
                      seniority: doctor.seniority,
                      college: doctor.college,
                    })
                  }
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  title={txt.delete}
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal />
    </div>
  );
};

export default AdminDashboard;


**عندما تنتهي من النسخ، أخبرني لننتقل للخطوة 4 (ملف `PatientsDashboard.jsx`).**