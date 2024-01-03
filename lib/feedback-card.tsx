"use client";

import { Button } from "@padar/button";
import { Card, CardHeader, CardContent, CardFooter } from "@padar/card";
import { Badge } from "@padar/badge";
import { cn } from "@padar/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@padar/avatar";
import { Alert, AlertTitle } from "@padar/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@padar/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@padar/dialog";

import { useRef, useState } from "react";

import {
  Loader2,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HeartIcon,
  MoreVerticalIcon,
  ReplyIcon,
  ShareIcon,
  CopyIcon,
  Loader,
} from "lucide-react";
import { Textarea } from "@padar/react";

export interface FeedbackCardProps {
  id: number;
  image?: string;
  authorName?: string;
  providerName?: string;
  serviceStatus?: string;
  date?: string;
  centerName?: string;
  isRecommended?: boolean;
  symptomes?: string[];
  text?: string;
  onLike?: () => void;
  editable?: boolean;
  dontShowAuthorName?: boolean;
  onReply?: ({ text }: { text: string }) => void;
  onRemove?: () => void;
  onEdit?: ({ text }: { text: string }) => void;
  replyLoading?: boolean;
  reply?: FeedbackCardProps[];
}

export const FeedbackCard = (props: FeedbackCardProps) => {
  const {
    id,
    authorName,
    providerName,
    centerName,
    date,
    image,
    isRecommended,
    serviceStatus,
    symptomes,
    text,
    onLike,
    reply,
    editable,
    dontShowAuthorName = false,
    onReply,
    replyLoading,
    onRemove,
    onEdit,
  } = props;
  const [isLike, setIsLike] = useState(false);
  const replyText = useRef<HTMLTextAreaElement>(null);
  const editText = useRef<HTMLTextAreaElement>(null);

  return (
    <Card className="relative w-full">
      <CardHeader className="flex-row items-center p-5 space-y-0">
        {image && (
          <Avatar className="ml-1">
            <AvatarImage src={image} alt={authorName} />
            <AvatarFallback>{""}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <div>
              {!dontShowAuthorName && authorName && (
                <span className="font-medium text-sm">{authorName}</span>
              )}
              {!dontShowAuthorName && authorName && providerName && <span className="mx-1">|</span>}
              {providerName && <span className="font-medium text-sm">برای {providerName}</span>}
            </div>
            {!!serviceStatus && (
              <Badge variant="secondary" className="mr-1">
                {serviceStatus}
              </Badge>
            )}
          </div>
          {(date || centerName) && (
            <span className="text-xs">
              {date}
              {!!centerName && ` | ${centerName}`}
            </span>
          )}
        </div>
        {editable && (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger className="absolute left-5 top-5">
              <MoreVerticalIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Dialog>
                <DialogTrigger className="w-full">
                  <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                    ویرایش
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="[&>button]:left-4 [&>button]:right-[unset]">
                  <DialogHeader className="sm:text-right space-y-3">
                    <DialogTitle>ویرایش نظر</DialogTitle>
                    <DialogDescription className="flex flex-col space-y-3">
                      <Textarea dir="rtl" ref={editText} defaultValue={text} />
                      <DialogClose className="w-full">
                        <Button
                          className="w-full"
                          onClick={() => onEdit?.({ text: editText.current?.value ?? "" })}
                        >
                          ویرایش
                        </Button>
                      </DialogClose>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger className="w-full">
                  <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                    حذف
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="[&>button]:left-4 [&>button]:right-[unset]">
                  <DialogHeader className="sm:text-right space-y-3">
                    <DialogTitle>آیا از حدف نظر مطمئن هستید؟</DialogTitle>
                    <DialogDescription className="flex flex-row gap-2">
                      <DialogClose className="w-full">
                        <Button className="w-full" variant="destructive" onClick={onRemove}>
                          حذف
                        </Button>
                      </DialogClose>
                      <DialogClose className="w-full">
                        <Button className="w-full" variant="outline">
                          انصراف
                        </Button>
                      </DialogClose>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="p-5 pb-4 pt-0 space-y-3 flex  flex-col">
        {typeof isRecommended !== "undefined" && (
          <Alert
            className={cn("border-0 p-0 flex items-center", {
              "text-green-600": isRecommended,
              "text-red-500": !isRecommended,
            })}
          >
            {isRecommended ? (
              <ThumbsUpIcon className="h-4 w-4 !static !text-inherit" />
            ) : (
              <ThumbsDownIcon className="h-4 w-4 !static !text-inherit" />
            )}

            {isRecommended ? (
              <AlertTitle className="mr-2 text-sm">پزشک را توصیه می‌کنم</AlertTitle>
            ) : (
              <AlertTitle className="mr-2 text-sm">پزشک را توصیه نمی‌کنم</AlertTitle>
            )}
          </Alert>
        )}
        {!!symptomes?.length && (
          <span className="text-sm">
            <b>علت مراجعه:</b> {symptomes}
          </span>
        )}
        {!!text && <span>{text}</span>}
      </CardContent>

      <CardFooter className="p-5 space-y-2 w-full flex-col pt-0">
        <div className="justify-end flex w-full">
          <Dialog>
            <DialogTrigger>
              <Button variant="ghost">
                <ReplyIcon className={cn("h-4 w-4 ml-1")} />
                <span className="text-sm">پاسخ</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="[&>button]:left-4 [&>button]:right-[unset]">
              <DialogHeader className="sm:text-right space-y-3">
                <DialogTitle>پاسخ به {authorName}</DialogTitle>
                <DialogDescription className="flex flex-col space-y-3">
                  <Textarea dir="rtl" ref={replyText} />
                  <DialogClose>
                    <Button
                      className="w-full"
                      onClick={() => onReply?.({ text: replyText?.current?.value ?? "" })}
                    >
                      {replyLoading && <Loader />}
                      {!replyLoading && "ثبت"}
                    </Button>
                  </DialogClose>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            onClick={() => {
              onLike?.();
              setIsLike((prev) => !prev);
            }}
            className="hover:bg-red-50"
          >
            <HeartIcon
              className={cn("h-4 w-4 ml-1", {
                "fill-red-600 text-red-600": isLike,
              })}
            />
            <span className="text-sm">پسندیدن</span>
          </Button>
        </div>

        {reply?.map((item) => (
          <FeedbackCard key={item.id} {...item} />
        ))}
      </CardFooter>
    </Card>
  );
};
