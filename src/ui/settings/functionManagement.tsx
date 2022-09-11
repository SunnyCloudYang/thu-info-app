import React, {useState} from "react";
import {getStr} from "../../utils/i18n";
import {currState, State, store} from "../../redux/store";
import {ScrollView, Switch, Text, useColorScheme, View} from "react-native";
import {connect} from "react-redux";
import themes from "../../assets/themes/themes";
import {configSet} from "../../redux/actions/config";
import {RoundedView} from "../../components/views";
import {styles} from "./settings";
import {HomeFunction} from "../home/home";
import {top5SetAction} from "../../redux/actions/top5";

const functions: HomeFunction[] = [
	"physicalExam",
	"teachingEvaluation",
	"report",
	"classroomState",
	"library",
	"sportsBook",
	"libRoomBook",
	"expenditure",
	"bankPayment",
	"invoice",
	"washer",
	"qzyq",
	"dormScore",
	"electricity",
];

const FunctionItem = ({
	func,
	needSeparator,
	value,
	onValueChange,
}: {
	func: HomeFunction;
	value: boolean;
	needSeparator: boolean;
	onValueChange: (value: boolean) => void;
}) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const style = styles(themeName);
	return (
		<>
			{needSeparator && <View style={style.separator} />}
			<View style={style.touchable}>
				<Text style={style.text}>{getStr(func as any)}</Text>
				<Switch
					thumbColor={value ? colors.primaryLight : undefined}
					trackColor={{true: colors.mainTheme}}
					value={value}
					onValueChange={onValueChange}
				/>
			</View>
		</>
	);
};

const FunctionManagementUI = ({
	homeFunctionDisabled,
}: {
	homeFunctionDisabled: HomeFunction[];
}) => {
	const themeName = useColorScheme();
	const {colors} = themes(themeName);
	const style = styles(themeName);
	const [disabledFuncList, setDisabledFuncList] =
		useState(homeFunctionDisabled);

	const handleValueChange = (f: HomeFunction, value: boolean) => {
		if (value) {
			// remove from disabled list
			if (disabledFuncList.includes(f)) {
				const payload = disabledFuncList.filter((i) => i !== f);
				setDisabledFuncList(payload);
				store.dispatch(configSet("homeFunctionDisabled", payload));
			}
		} else {
			// add to disabled list
			if (!disabledFuncList.includes(f)) {
				const payload = disabledFuncList.concat([f]);
				setDisabledFuncList(payload);
				store.dispatch(configSet("homeFunctionDisabled", payload));
				const top5 = currState().top5.top5Functions;
				if (top5.includes(f)) {
					store.dispatch(top5SetAction(top5.filter((i) => i !== f))); // remove from top5
				}
			}
		}
	};

	return (
		<ScrollView style={{flex: 1, padding: 12}}>
			<Text style={{marginLeft: 8, color: colors.fontB2}}>
				{getStr("functionManagementTip")}
			</Text>
			<RoundedView style={[style.rounded, {marginTop: 12}]}>
				{functions.slice(2, 4).map((f, index) => (
					<FunctionItem
						key={f}
						func={f}
						needSeparator={index !== 0}
						value={!disabledFuncList.includes(f)}
						onValueChange={(value) => {
							handleValueChange(f, value);
						}}
					/>
				))}
			</RoundedView>
			<Text style={{marginLeft: 8, color: colors.fontB2, marginTop: 12}}>
				{getStr("seasonalFeatures")}
			</Text>
			<RoundedView style={[style.rounded, {marginTop: 12}]}>
				{functions.slice(0, 2).map((f, index) => (
					<FunctionItem
						key={f}
						func={f}
						needSeparator={index !== 0}
						value={!disabledFuncList.includes(f)}
						onValueChange={(value) => {
							handleValueChange(f, value);
						}}
					/>
				))}
			</RoundedView>
			<Text style={{marginLeft: 8, color: colors.fontB2, marginTop: 12}}>
				{getStr("reservation")}
			</Text>
			<RoundedView style={[style.rounded, {marginTop: 12}]}>
				{functions.slice(4, 7).map((f, index) => (
					<FunctionItem
						key={f}
						func={f}
						needSeparator={index !== 0}
						value={!disabledFuncList.includes(f)}
						onValueChange={(value) => {
							handleValueChange(f, value);
						}}
					/>
				))}
			</RoundedView>
			<Text style={{marginLeft: 8, color: colors.fontB2, marginTop: 12}}>
				{getStr("campusFinance")}
			</Text>
			<RoundedView style={[style.rounded, {marginTop: 12}]}>
				{functions.slice(7, 10).map((f, index) => (
					<FunctionItem
						key={f}
						func={f}
						needSeparator={index !== 0}
						value={!disabledFuncList.includes(f)}
						onValueChange={(value) => {
							handleValueChange(f, value);
						}}
					/>
				))}
			</RoundedView>
			<Text style={{marginLeft: 8, color: colors.fontB2, marginTop: 12}}>
				{getStr("dorm")}
			</Text>
			<RoundedView style={[style.rounded, {marginTop: 12}]}>
				{functions.slice(10, 14).map((f, index) => (
					<FunctionItem
						key={f}
						func={f}
						needSeparator={index !== 0}
						value={!disabledFuncList.includes(f)}
						onValueChange={(value) => {
							handleValueChange(f, value);
						}}
					/>
				))}
			</RoundedView>
			<View style={{marginBottom: 16}} />
		</ScrollView>
	);
};

export const FunctionManagementScreen = connect((state: State) => ({
	...state.config,
}))(FunctionManagementUI);
