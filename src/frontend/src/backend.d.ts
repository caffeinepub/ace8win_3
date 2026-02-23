import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface PlayerInfo {
    playerId: string;
    registrationDetails: UserProfile;
}
export interface Payment {
    status: PaymentStatus;
    submissionTime: Time;
    proofScreenshot?: ExternalBlob;
    amount: bigint;
}
export interface Match {
    id: string;
    startTime: Time;
    status: MatchStatus;
    participants: Array<Principal>;
    duration: bigint;
    name: string;
    joinedPlayers: Array<PlayerInfo>;
    paymentAmount: bigint;
}
export interface UserProfile {
    refundQr: Uint8Array;
    gameUid: string;
    gameName: string;
    phoneNumber: string;
}
export interface Transaction {
    paymentStatus: PaymentStatus;
    refundStatus?: string;
    time: Time;
    user: Principal;
    matchId: string;
    amount: bigint;
}
export enum MatchStatus {
    upcoming = "upcoming",
    live = "live",
    finished = "finished"
}
export enum PaymentStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approvePayment(user: Principal, matchId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMatch(name: string, startTime: Time, duration: bigint, paymentAmount: bigint): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    getAllMatches(): Promise<Array<Match>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMatchParticipants(matchId: string): Promise<Array<PlayerInfo>>;
    getPayment(user: Principal): Promise<Payment>;
    getPaymentStatus(user: Principal): Promise<PaymentStatus>;
    getTransactionHistory(user: Principal): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    isValidPhoneNumber(phoneNumber: string): Promise<boolean>;
    joinMatch(matchId: string): Promise<void>;
    promoteToUser(user: Principal): Promise<void>;
    registerUser(gameUid: string, gameName: string, phoneNumber: string, refundQr: Uint8Array): Promise<void>;
    rejectPayment(user: Principal, matchId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPayment(matchId: string, amount: bigint, proofScreenshot: ExternalBlob): Promise<void>;
    updateUserProfile(user: Principal, gameUid: string, gameName: string, phoneNumber: string, refundQr: Uint8Array): Promise<void>;
}
