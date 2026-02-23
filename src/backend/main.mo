import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type MatchStatus = { #upcoming; #live; #finished };
  type PaymentStatus = { #pending; #approved; #rejected };

  type UserProfile = {
    gameUid : Text;
    gameName : Text;
    phoneNumber : Text;
    refundQr : [Nat8];
  };

  module UserProfile {
    public func compareByPhoneNumber(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.phoneNumber, p2.phoneNumber);
    };
  };

  type PlayerInfo = {
    playerId : Text;
    registrationDetails : UserProfile;
  };

  type Match = {
    id : Text;
    name : Text;
    startTime : Time.Time;
    duration : Nat;
    status : MatchStatus;
    participants : [Principal];
    joinedPlayers : [PlayerInfo];
    paymentAmount : Nat;
  };

  module Match {
    public func compareByStartTime(m1 : Match, m2 : Match) : Order.Order {
      Int.compare(m1.startTime, m2.startTime);
    };
  };

  type Payment = {
    amount : Nat;
    proofScreenshot : ?Storage.ExternalBlob;
    status : PaymentStatus;
    submissionTime : Time.Time;
  };

  module Payment {
    public func compareByAmount(p1 : Payment, p2 : Payment) : Order.Order {
      Nat.compare(p1.amount, p2.amount);
    };
  };

  type Transaction = {
    user : Principal;
    matchId : Text;
    amount : Nat;
    paymentStatus : PaymentStatus;
    refundStatus : ?Text;
    time : Time.Time;
  };

  module Transaction {
    public func compareByTime(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t1.time, t2.time);
    };
  };

  let users = Map.empty<Principal, UserProfile>();
  let matches = Map.empty<Text, Match>();
  let payments = Map.empty<Principal, Payment>();
  let transactions = Map.empty<Principal, Transaction>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // User Registration
  public shared ({ caller }) func registerUser(gameUid : Text, gameName : Text, phoneNumber : Text, refundQr : [Nat8]) : async () {
    if (users.containsKey(caller)) { Runtime.trap("User already registered") };

    let profile : UserProfile = {
      gameUid;
      gameName;
      phoneNumber;
      refundQr;
    };

    users.add(caller, profile);

    let role = switch (users.size()) {
      case (1) { #admin };
      case (_) { #user };
    };

    AccessControl.assignRole(accessControlState, caller, caller, role);
  };

  // Required by frontend: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  // Required by frontend: Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  // Match Creation (Admin)
  public shared ({ caller }) func createMatch(name : Text, startTime : Time.Time, duration : Nat, paymentAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create matches");
    };
    let match : Match = {
      id = name;
      name;
      startTime;
      duration;
      status = #upcoming;
      participants = [];
      joinedPlayers = [];
      paymentAmount;
    };
    matches.add(name, match);
  };

  // Join Match
  public shared ({ caller }) func joinMatch(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can join matches");
    };

    let userProfile = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) { profile };
    };

    let match = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?m) { m };
    };

    let playerInfo : PlayerInfo = {
      playerId = caller.toText();
      registrationDetails = userProfile;
    };

    let updatedMatch = {
      match with
      participants = match.participants.concat([caller]);
      joinedPlayers = match.joinedPlayers.concat([playerInfo]);
    };

    matches.add(matchId, updatedMatch);
  };

  // UPI Payment Submission
  public shared ({ caller }) func submitPayment(matchId : Text, amount : Nat, proofScreenshot : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can submit payments");
    };

    let payment : Payment = {
      amount;
      proofScreenshot = ?proofScreenshot;
      status = #pending;
      submissionTime = Time.now();
    };

    payments.add(caller, payment);

    let transaction : Transaction = {
      user = caller;
      matchId;
      amount;
      paymentStatus = #pending;
      refundStatus = null;
      time = Time.now();
    };

    transactions.add(caller, transaction);
  };

  // Admin Payment Approval
  public shared ({ caller }) func approvePayment(user : Principal, matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve payments");
    };

    updateTransactionStatus(user, matchId, #approved);
  };

  // Admin Payment Rejection
  public shared ({ caller }) func rejectPayment(user : Principal, matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject payments");
    };

    updateTransactionStatus(user, matchId, #rejected);
  };

  func updateTransactionStatus(user : Principal, matchId : Text, newStatus : PaymentStatus) {
    let payment = switch (payments.get(user)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?p) { p };
    };

    let match = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?m) { m };
    };

    let transaction = switch (transactions.get(user)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?t) { t };
    };

    payments.add(
      user,
      { payment with status = newStatus }
    );

    transactions.add(
      user,
      { transaction with
        paymentStatus = newStatus;
        matchId;
        refundStatus = if (newStatus == #approved) { null } else { transaction.refundStatus };
      }
    );
  };

  // Admin: Modify user account details
  public shared ({ caller }) func updateUserProfile(user : Principal, gameUid : Text, gameName : Text, phoneNumber : Text, refundQr : [Nat8]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify user accounts");
    };

    let profile : UserProfile = {
      gameUid;
      gameName;
      phoneNumber;
      refundQr;
    };

    users.add(user, profile);
  };

  // Admin: Delete user account
  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete user accounts");
    };

    users.remove(user);
    payments.remove(user);
    transactions.remove(user);
  };

  // Admin: Promote user to user role (needed after registration)
  public shared ({ caller }) func promoteToUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };

    if (not users.containsKey(user)) {
      Runtime.trap("User not registered");
    };

    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  // Queries
  public query ({ caller }) func getAllMatches() : async [Match] {
    matches.values().toArray().sort(Match.compareByStartTime);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (users.get(user)) {
      case (null) { Runtime.trap("Entry:d4222dbe-a171-49fa-b668-2aa36ff5a8d9-user-not-found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };

    users.values().toArray().sort(UserProfile.compareByPhoneNumber);
  };

  public query ({ caller }) func getMatchParticipants(matchId : Text) : async [PlayerInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view match participants");
    };

    let match = switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Entry:6e445117-9176-408c-b69f-a7e8e8367d59-match-not-found") };
      case (?m) { m };
    };
    match.joinedPlayers;
  };

  public query ({ caller }) func getTransactionHistory(user : Principal) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transaction history");
    };

    let allTransactions = transactions.values().toArray();
    let userTransactions = allTransactions.filter(
      func(t) { t.user == user }
    );
    userTransactions.sort(Transaction.compareByTime);
  };

  public query ({ caller }) func getPayment(user : Principal) : async Payment {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payment");
    };

    switch (payments.get(user)) {
      case (null) { Runtime.trap("Entry:c6efe25d-1660-4a3d-bb3b-1a8a0aa74216-payment-not-found") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getPaymentStatus(user : Principal) : async PaymentStatus {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payment status");
    };

    let payment = switch (payments.get(user)) {
      case (null) { Runtime.trap("Entry:6d9c9865-0eee-4823-81a1-aab73360c92c-payment-not-found") };
      case (?p) { p };
    };
    payment.status;
  };

  // Regex for phone number validation
  public shared ({ caller }) func isValidPhoneNumber(phoneNumber : Text) : async Bool {
    if (phoneNumber.size() != 10) { return false };
    let chars = phoneNumber.toArray();
    switch (chars.values().next()) {
      case (?firstChar) {
        switch (firstChar) {
          case ('7') { true };
          case ('8') { true };
          case ('9') { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };
};
