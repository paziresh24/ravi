"use client";

import React from "react";
import { Button } from "@padar/button";
import { Loader2, MessageCircleDashedIcon, UserIcon } from "lucide-react";
import { FeedbackCard } from "@/lib/feedback-card";
import useSWRInfinite from "swr/infinite";
import useSWR from "swr";
import toast from "react-hot-toast";

const getKey = (pageIndex: number, previousPageData: any, userId: string) => {
  if (previousPageData && !previousPageData.result.length) return null; // reached the end

  if (pageIndex === 0)
    return `https://apigw.paziresh24.com/v1/feedbacks?user_id=${userId}&additional_fields=doctor_full_name&order_by=created_at`;

  return `https://apigw.paziresh24.com/v1/feedbacks?user_id=${userId}&page=${
    pageIndex + 1
  }&additional_fields=doctor_full_name&order_by=created_at`;
};

export default function Home({ params }: { params: { user_id: string } }) {
  const { data: userData } = useSWR("https://apigw.paziresh24.com/v1/auth/me");
  const loginedUser = userData?.users?.[0];

  const {
    data: feedbacksData,
    setSize,
    size,
    isLoading,
    error,
  } = useSWRInfinite((pageIndex, previousPageData) => {
    return getKey(pageIndex, previousPageData, params.user_id);
  });
  const { data: usersData, isLoading: usersLoading } = useSWR(
    `https://apigw.paziresh24.com/v1/users/${params.user_id}`
  );
  const user = usersData?.users?.[0];
  const feedbacks: any[] = feedbacksData
    ? [].concat(
        ...feedbacksData.map((item) => {
          return item?.result;
        })
      )
    : [];

  const isLoadingMore =
    isLoading || (size > 0 && feedbacksData && typeof feedbacksData[size - 1] === "undefined");

  const likeHandler = async (id: string) => {
    const formData = new FormData();
    formData.append("feedback_id", id);
    const res = await fetch(`https://www.paziresh24.com/api/likeOrDislikeFeedback/`, {
      body: formData,
      method: "POST",
      credentials: "include",
    });
  };

  const replyHandler = async ({
    id,
    text,
    doctorId,
    serverId,
  }: {
    id: string;
    text: string;
    doctorId: string;
    serverId: string;
  }) => {
    const formData = new FormData();
    formData.append("feedback_id", id);
    formData.append("description", text);
    formData.append("doctor_id", doctorId);
    formData.append("server_id", serverId);
    toast("نظر شما ثبت گردید و پس از تایید نمایش داده خواهد شد.");
    const res = await fetch(`https://www.paziresh24.com/api/replyFeedback/`, {
      body: formData,
      method: "POST",
      credentials: "include",
    });
  };

  const removeHandler = async ({ id }: { id: string }) => {
    toast("درخواست شما با موفقیت انجام شد. نظر شما، پس از گذشت 24 ساعت حذف خواهد شد.");
    const res = await fetch(`https://apigw.paziresh24.com/mizaan/v1/feedbacks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const editHandler = async ({ id, text, like }: { id: string; text: string; like: string }) => {
    toast("نظر شما پس از بررسی و با استناد به قوانین پذیرش24 ویرایش خواهد شد.");
    const res = await fetch(`https://apigw.paziresh24.com/mizaan/v1/feedbacks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        feedback_id: id,
        description: text,
        like: like,
      }),
      credentials: "include",
    });
  };

  return (
    <main className="flex bg-gray-50 min-h-screen flex-col items-center p-5 md:py-24">
      {(isLoading || usersLoading || !user) && <Loader2 className="animate-spin" />}

      {!isLoading && !usersLoading && user && (
        <div className="w-full space-y-6 flex flex-col justify-center items-center">
          <div className="flex flex-col space-y-3 lg:w-2/5 w-full">
            <div className="flex gap-1 items-center">
              <UserIcon />
              <span className="font-bold">
                {user.name} {user.family}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-3 lg:w-2/5 w-full">
            {(!!error || feedbacks.length === 0) && (
              <div className="w-full flex flex-col opacity-60 items-center py-10 space-y-3">
                <MessageCircleDashedIcon width={40} height={40} />
                <span className="font-medium">نظری یافت نشد.</span>
              </div>
            )}
            {feedbacks?.map((feedback: any) => (
              <FeedbackCard
                key={feedback.id}
                editable={loginedUser?.id === params?.user_id}
                id={feedback.id}
                centerName={feedback?.center_name}
                date={feedback?.formatted_date}
                isRecommended={feedback.recommended === "1"}
                serviceStatus={feedback.book_status && "ویزیت شده"}
                symptomes={feedback.feedback_symptomes?.map((item: any) => item.symptomes)}
                text={feedback?.description}
                onLike={() => likeHandler(feedback.id)}
                authorName={feedback?.user_name}
                providerName={feedback?.doctor_full_name}
                dontShowAuthorName={feedback?.user_id === params?.user_id}
                onReply={({ text }) =>
                  replyHandler({
                    id: feedback.id,
                    text,
                    doctorId: feedback.doctor_id,
                    serverId: feedback.server_id,
                  })
                }
                onRemove={() => removeHandler({ id: feedback.id })}
                onEdit={({ text }) => editHandler({ id: feedback.id, text, like: feedback.like })}
                reply={feedback.reply?.map?.((item: any) => ({
                  id: item.id,
                  text: item?.description,
                  onLike: () => likeHandler(item.id),
                  onRemove: () => removeHandler({ id: item.id }),
                  onEdit: ({ text }: { text: string }) =>
                    editHandler({ id: item.id, text, like: item.like }),
                  editable: loginedUser?.id === params?.user_id,
                  authorName: user?.name,
                  providerName: feedback?.user_name,
                }))}
              />
            ))}
            {(feedbacksData ?? [])[(feedbacksData ?? [])?.length - 1]?.result?.length === 10 && (
              <Button variant="outline" onClick={() => setSize(size + 1)}>
                {isLoadingMore && !error ? <Loader2 className="animate-spin" /> : "نمایش بیشتر"}
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
