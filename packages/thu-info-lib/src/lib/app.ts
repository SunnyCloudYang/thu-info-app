import {InfoHelper} from "../index";
import {uFetch} from "../utils/network";
import {roamingWrapperWithMocks} from "./core";
import {
    APP_ANNOUNCEMENT_URL,
    APP_FEEDBACKS_URL,
    APP_LATEST_VERSION_URL,
    APP_PRIVACY_URL,
    APP_QRCODE_URL,
    APP_STARTUP_STAT_URL,
    APP_SUBMIT_FEEDBACK_URL,
    APP_USAGE_STAT_URL,
} from "../constants/strings";
import {Announcement} from "../models/app/announcement";
import {Version} from "../models/app/version";
import {
    MOCK_APP_PRIVACY_URL,
    MOCK_FEEDBACK_REPLIES,
    MOCK_LATEST_ANNOUNCEMENTS,
    MOCK_LATEST_VERSION,
    MOCK_QRCODE_URL,
} from "../mocks/app";
import {Feedback} from "../models/app/feedback";

export const appStartupStat = async (helper: InfoHelper, uuid: string): Promise<void> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        async () => {
            await uFetch(
                APP_STARTUP_STAT_URL,
                JSON.stringify({Uuid: uuid}) as never as object,
                60000,
                "UTF-8",
                true,
                "application/json",
            );
        },
        undefined,
    );

export const appUsageStat = async (helper: InfoHelper, usage: number, uuid: string): Promise<void> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        async () => {
            await uFetch(
                `${APP_USAGE_STAT_URL}`,
                JSON.stringify({Uuid: uuid, Function: usage}) as never as object,
                60000,
                "UTF-8",
                true,
                "application/json",
            );
        },
        undefined,
    );

export const getLatestAnnounces = async (helper: InfoHelper, version?: string): Promise<Announcement[]> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        () => uFetch(APP_ANNOUNCEMENT_URL + (version ?? "0.0.0")).then(JSON.parse).then((r: any[]) => r.map((e) => ({
            id: e.id,
            title: e.title,
            content: e.content,
            createdAt: Date.parse(e.createdTime),
            visibleNotAfter: e.visibleNotAfter,
            visibleExact: e.visibleExact
        }))),
        MOCK_LATEST_ANNOUNCEMENTS,
    );

export const getLatestVersion = async (helper: InfoHelper, platform: "ios" | "android"): Promise<Version> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        () => uFetch(`${APP_LATEST_VERSION_URL}/${platform}`).then(JSON.parse),
        MOCK_LATEST_VERSION,
    );

export const submitFeedback = async (
    helper: InfoHelper,
    content: string,
    appversion: string,
    os: string,
    nickname: string,
    contact: string,
    phonemodel: string,
): Promise<void> => roamingWrapperWithMocks(
    helper,
    undefined,
    "",
    () => uFetch(
        APP_SUBMIT_FEEDBACK_URL,
        JSON.stringify({
            content,
            appversion,
            os,
            nickname,
            contact,
            phonemodel,
        }) as never as object,
        60000,
        "UTF-8",
        true,
        "application/json",
    ).then(() => {
    }),
    undefined,
);

export const getFeedbackReplies = async (helper: InfoHelper): Promise<Feedback[]> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        () => uFetch(APP_FEEDBACKS_URL).then(JSON.parse),
        MOCK_FEEDBACK_REPLIES,
    );

export const getWeChatGroupQRCodeContent = async (helper: InfoHelper): Promise<string> =>
    roamingWrapperWithMocks(
        helper,
        undefined,
        "",
        async () => {
            const url = await uFetch(APP_QRCODE_URL);
            if (!url.match(/https?:\/\/weixin.qq.com/)) {
                throw new Error("Failed to get Wechat Group QR Code.");
            }
            return url;
        },
        MOCK_QRCODE_URL,
    );

export const getPrivacyUrl = (helper: InfoHelper): string => helper.mocked() ? MOCK_APP_PRIVACY_URL : APP_PRIVACY_URL;
