"use client";

import Button from "@/app/components/Button";
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
    <Button onClick={handleAdmin} text="어드민 페이지" variant="secondary" />
  );
};

export default AdminButton;
