import { InfoHelper } from "../index";
import { getCsrfToken } from "../lib/core";
import { getRedirectUrl, uFetch } from "../utils/network";
import { NewsSlice, SourceTag } from "../models/news/news";
import { FILE_DOWNLOAD_URL, NEWS_DETAIL_URL, NEWS_LIST_URL, NEWS_REDIRECT_URL } from "../constants/strings";
import { newsHtml } from "../mocks/source/newsHtml";
import cheerio from "cheerio";

/**
 * Get News List
 * @param helper
 * @param page
 * @param length
 * @param channel
 * @returns Array of NewsSlice
 */
export const getNewsList = async (helper: InfoHelper, page: number, length: number, channel?: SourceTag): Promise<NewsSlice[]> => {
    const newsList: NewsSlice[] = [];
    const json = await uFetch(`${NEWS_LIST_URL}&lmid=${channel ?? "all"}&currentPage=${page}&length=${length}&_csrf=${await getCsrfToken()}`);
    const data: { object: { dataList: { bt: string, url: string, time: string, dwmc: string, lmid: SourceTag }[] } } = JSON.parse(json);
    data.object.dataList.forEach(element => {
        newsList.push({
            name: parseXmlEscape(element.bt),
            url: parseXmlEscape(element.url),
            date: element.time,
            source: element.dwmc,
            channel: element.lmid
        });
    });
    return newsList;
};

const policyList: [string, [string, string]][] = [
    ["jwcbg", [".TD4", "td[colspan=4]:not(td[height])"]],
    [
        "kybg",
        [".style1", "table[width='95%'][cellpadding='3'] tr:nth-child(3)"],
    ],
    ["gjc", [".style11", "[width='85%'] td"]],
    [
        "77726476706e69737468656265737421f2fa598421322653770bc7b88b5c2d32530b094045c3bd5cabf3",
        [".TD1", "td[colspan=4]:not(td[height])"],
    ],
    [
        "77726476706e69737468656265737421e0f852882e3e6e5f301c9aa596522b2043f84ba24ebecaf8",
        [".cont_doc_box h5 span", "div.field-item"],
    ],
    [
        "77726476706e69737468656265737421e9fd528569336153301c9aa596522b20735d12f268e561f0",
        [
            "h3",
            "[style='text-align:left; width:90%; magin:0px auto; padding-top:20px;  padding-bottom:20px;word-break:break-all;']",
        ],
    ],
    [
        "77726476706e69737468656265737421f8e60f8834396657761d88e29d51367b523e",
        ["h1", ".r_cont > ul"],
    ],
    [
        "77726476706e69737468656265737421e8ef439b69336153301c9aa596522b20e1a870705b76e399",
        ["", ".td4"],
    ],
    ["rscbg", ["[height=40]", "[width='95%'] > tr:nth-child(3)"]],
    [
        "77726476706e69737468656265737421e7e056d234297b437c0bc7b88b5c2d3212b31e4d37621d4714d6",
        ["", "[style='text-align:left']"],
    ],
    ["ghxt", ["", "[valign=top]:not([class])"]],
    [
        "fgc",
        [
            ".title_b",
            "[style='width:647px;margin-left:6px;font-size:13px;line-height:20px;text-align:justify']",
        ],
    ],
    [
        "77726476706e69737468656265737421e8e442d23323615e79009cadd6502720f9b87b",
        [
            ".bt",
            ".xqbox",
        ],
    ],
    [
        "77726476706e69737468656265737421e4ff459d207e6b597d469dbf915b243de94c4812e5c2e1599f",
        [
            ".TD_right > font",
            "td[colspan=4]:not(td[height])",
        ],
    ],
    [
        "jdbsc",
        [
            ".TD1",
            "[width=95%]:nth-child(2) > tr:nth-child(1)",
        ],
    ],
];

const getNewsDetailPolicy = (
    url: string,
): [string | undefined, string | undefined] => {
    for (let i = 0; i < policyList.length; ++i) {
        if (url.indexOf(policyList[i][0]) !== -1) {
            return policyList[i][1];
        }
    }
    return [undefined, undefined];
};

const parseXmlEscape = (text: string): string => {
    let result = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ");
    const matches = result.match(/&#[0-9]+;/g);
    if (!matches) return result;
    matches.forEach(m => {
        const number = /[0-9]+/.exec(m)?.[0] as string;
        const char = String.fromCharCode(Number(number));
        result = result.replace(m, char);
    });
    return result;
};

const handleNewApiNews = async (url: string): Promise<[string, string, string]> => {
    const html = await uFetch(url);
    const csrf = await getCsrfToken();
    const xxid: string = /(?<=var xxid = ").*?(?=";)/.exec(html)?.[0] as string;
    const resp = await uFetch(`${NEWS_DETAIL_URL}?xxid=${xxid}&preview=false&_csrf=${csrf}`);
    const data: { object: { xxDto: { bt: string, nr: string, fjs_template?: { wjid: string, wjmc: string }[] } } } = JSON.parse(resp);
    const title = parseXmlEscape(data.object.xxDto.bt);
    let content = "<div>" + parseXmlEscape(data.object.xxDto.nr);
    if (data.object.xxDto.fjs_template) {
        data.object.xxDto.fjs_template.forEach(file => {
            content += `<a href="${FILE_DOWNLOAD_URL + file.wjid}?_csrf=${csrf}">${file.wjmc}</a>`;
        });
    }
    content += "</div>";
    const jianjie = parseXmlEscape(data.object.xxDto.nr).replace(/<[^>]+>/g, "");
    return [title, content, jianjie];
};

export const getNewsDetail = async (helper: InfoHelper, url: string): Promise<[string, string, string]> => {
    if (url.includes("xxid")) return await handleNewApiNews(NEWS_REDIRECT_URL + url);
    else return await getNewsDetailOld(helper, await getRedirectUrl(NEWS_REDIRECT_URL + url));
};

const getNewsDetailOld = async (
    helper: InfoHelper,
    url: string,
): Promise<[string, string, string]> => {
    const [title, content] = getNewsDetailPolicy(url);
    const html = helper.mocked() ? newsHtml[url] ?? "" : await uFetch(url);
    if (title !== undefined && content) {
        const r = cheerio(content, html);
        return [
            cheerio(title, html).text(),
            r.html() ?? "",
            r.text().replace(/\s/g, ""),
        ];
    } else {
        return ["", html, ""];
    }
};
