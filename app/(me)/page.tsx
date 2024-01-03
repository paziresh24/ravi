"use client";

import { Button } from "@padar/button";
import { useSWRConfig } from "swr";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

import {
  Loader2,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HeartIcon,
  MoreVerticalIcon,
  MessagesSquareIcon,
  MessageCircleDashedIcon,
} from "lucide-react";
import { FeedbackCard } from "@/lib/feedback-card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@padar/tabs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const getKey = (
  pageIndex: number,
  previousPageData: any,
  userId: string,
  slug: string | null,
  isDoctor: boolean
) => {
  if (previousPageData && !previousPageData.result.length) return null; // reached the end

  if (pageIndex === 0)
    return `https://apigw.paziresh24.com/v1/feedbacks?${
      isDoctor ? `slug=${slug}` : `user_id=${userId}`
    }&additional_fields=doctor_full_name&order_by=created_at`;

  return `https://apigw.paziresh24.com/v1/feedbacks?${
    isDoctor ? `slug=${slug}` : `user_id=${userId}`
  }&page=${pageIndex + 1}&additional_fields=doctor_full_name&order_by=created_at`;
};

export default function Home() {
  const searchParams = useSearchParams();
  const { data: userData, isLoading: userLoading } = useSWR(
    "https://apigw.paziresh24.com/v1/auth/me"
  );
  const user = userData?.users?.[0];
  const isLogined = !!user;

  const [tab, setTab] = useState(searchParams.get("slug") ? "profile" : "my-reviews");
  const {
    data: feedbacksData,
    setSize,
    size,
    isLoading,
    error,
  } = useSWRInfinite((pageIndex, previousPageData) =>
    user.id
      ? getKey(pageIndex, previousPageData, user.id, searchParams.get("slug"), tab === "profile")
      : null
  );

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
    toast("نظر شما پس از بررسی و با استناد به قوانین پذیرش24 منتشر خواهد شد.");
    await fetch(`https://www.paziresh24.com/api/replyFeedback/`, {
      body: formData,
      method: "POST",
      credentials: "include",
    });
  };

  const removeHandler = async ({ id }: { id: string }) => {
    toast("درخواست شما با موفقیت انجام شد. نظر شما، پس از گذشت 24 ساعت حذف خواهد شد.");
    await fetch(`https://apigw.paziresh24.com/mizaan/v1/feedbacks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const editHandler = async ({ id, text, like }: { id: string; text: string; like: string }) => {
    toast("نظر شما پس از بررسی و با استناد به قوانین پذیرش24 ویرایش خواهد شد.");
    await fetch(`https://apigw.paziresh24.com/mizaan/v1/feedbacks/${id}`, {
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
      {(userLoading || isLoading) && <Loader2 className="animate-spin" />}
      {!userLoading && !isLogined && <Button size="lg">ورود با پذیرش24</Button>}

      {!isLoading && user?.id && (
        <div className="flex flex-col space-y-3 lg:w-2/5 w-full">
          {searchParams.get("slug") && (
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value);
              }}
              defaultValue="profile"
              dir="rtl"
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="profile">نظرات پروفایل</TabsTrigger>
                <TabsTrigger value="my-reviews">نظرات من</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {!!error && (
            <div className="w-full flex flex-col opacity-60 items-center py-10 space-y-3">
              <MessageCircleDashedIcon width={40} height={40} />
              <span className="font-medium">نظری یافت نشد.</span>
            </div>
          )}
          {feedbacks?.map((feedback: any) => (
            <FeedbackCard
              key={feedback.id}
              editable={+feedback?.user_id === user?.id}
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
              dontShowAuthorName={+feedback?.user_id === user?.user_id}
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
                editable: +item?.user_id === user?.id,
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
      )}
    </main>
  );
}
