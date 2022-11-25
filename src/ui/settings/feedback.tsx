import {
	GestureResponderEvent,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import React, {useEffect, useState} from "react";
import zh from "../../assets/translations/zh";
import {getStr} from "../../utils/i18n";
import {RootNav} from "../../components/Root";
import Snackbar from "react-native-snackbar";
import {useColorScheme} from "react-native";
import {
	getFeedbackReplies,
	getWeChatGroupQRCodeContent,
	submitFeedback,
} from "../../utils/webApi";
import {
	SettingsItem,
	SettingsMiddleText,
	SettingsSeparator,
} from "../../components/settings/items";
import QRCode from "react-native-qrcode-svg";
import themes from "../../assets/themes/themes";

const BottomButton = ({
	text,
	onPress,
	disabled,
}: {
	text: keyof typeof zh;
	onPress: (event: GestureResponderEvent) => void;
	disabled: boolean;
}) => {
	const themeName = useColorScheme();
	const theme = themes(themeName);
	return (
		<TouchableOpacity
			style={{
				backgroundColor: theme.colors.themePurple,
				flex: 1,
				margin: 4,
				borderRadius: 4,
			}}
			disabled={disabled}
			onPress={(e) => !disabled && onPress(e)}>
			<Text
				style={{
					textAlign: "center",
					padding: 10,
					color: theme.colors.contentBackground,
				}}>
				{getStr(text)}
			</Text>
		</TouchableOpacity>
	);
};

type AsyncReturnType<T extends (...args: any) => any> = T extends (
	...args: any
) => Promise<infer U>
	? U
	: T extends (...args: any) => infer U
	? U
	: any;

export const FeedbackScreen = ({navigation}: {navigation: RootNav}) => {
	const [text, setText] = useState("");
	const [contact, setContact] = useState("");
	const [qrcodeContent, setQrcodeContent] = useState<string>();
	const [feedbackData, setFeedbackData] = useState<
		AsyncReturnType<typeof getFeedbackReplies>
	>([]);
	const [processing, setProcessing] = useState(false);
	const themeName = useColorScheme();
	const {colors} = themes(themeName);

	useEffect(() => {
		getFeedbackReplies().then(setFeedbackData);
		getWeChatGroupQRCodeContent().then(setQrcodeContent);
	}, []);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{flex: 1}}>
			<ScrollView style={{marginHorizontal: 12}}>
				<Text style={{fontSize: 20, marginLeft: 30, fontWeight: "bold"}}>
					{getStr("askBox")}
				</Text>
				{feedbackData.slice(0, 5).map(({question}) => (
					<SettingsItem
						key={question}
						text={question}
						onPress={() => navigation.navigate("Popi")}
						icon={undefined}
						normalText={true}
					/>
				))}
				<SettingsMiddleText
					text={getStr("more")}
					onPress={() => navigation.navigate("Popi")}
				/>
				<SettingsSeparator />
				<View
					style={{
						backgroundColor: colors.themeBackground,
						alignItems: "center",
					}}>
					{qrcodeContent !== undefined && (
						<>
							<QRCode value={qrcodeContent} size={80} />
							<Text style={{marginTop: 6, color: "grey"}}>
								{getStr("wechatPrompt")}
							</Text>
						</>
					)}
				</View>
				<TextInput
					value={text}
					onChangeText={setText}
					style={{
						textAlignVertical: "top",
						fontSize: 15,
						marginTop: 12,
						padding: 12,
						backgroundColor: colors.themeBackground,
						color: colors.text,
						borderColor: colors.inputBorder,
						borderWidth: 1,
						borderRadius: 5,
					}}
					placeholder={getStr("feedbackHint")}
					placeholderTextColor={colors.fontB3}
					multiline={true}
				/>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
					}}>
					<TextInput
						value={contact}
						onChangeText={setContact}
						style={{
							flex: 3,
							textAlignVertical: "top",
							fontSize: 15,
							marginVertical: 8,
							padding: 12,
							backgroundColor: colors.themeBackground,
							color: colors.text,
							borderColor: colors.inputBorder,
							borderWidth: 1,
							borderRadius: 5,
						}}
						placeholder={getStr("contact")}
						placeholderTextColor={colors.fontB3}
					/>
					<BottomButton
						text="submit"
						onPress={() => {
							setProcessing(true);
							submitFeedback(text, contact)
								.then(() =>
									Snackbar.show({
										text: getStr("feedbackSuccess"),
										duration: Snackbar.LENGTH_SHORT,
									}),
								)
								.then(() => setText(""))
								.catch(() =>
									Snackbar.show({
										text: getStr("networkRetry"),
										duration: Snackbar.LENGTH_SHORT,
									}),
								)
								.then(() => setProcessing(false));
						}}
						disabled={text.length === 0 || processing}
					/>
				</View>
				<BottomButton
					text="feishuFeedback"
					onPress={() => {
						navigation.navigate("FeishuFeedback");
					}}
					disabled={false}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
