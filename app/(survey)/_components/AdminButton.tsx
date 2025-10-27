"use client";

import { useRouter } from "next/navigation";

const AdminButton = ({ progress }: { progress: boolean }) => {
  const router = useRouter();

  const handleAdmin = () => {
    if (progress) {
      router.push("/admin");
    } else {
      alert("진행 중인 설문이 없습니다.");
    }
  };

  return (
    <button
      onClick={handleAdmin}
      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 border cursor-pointer"
    >
      어드민 페이지
    </button>
  );
};

export default AdminButton;
