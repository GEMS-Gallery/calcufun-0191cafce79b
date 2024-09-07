import Hash "mo:base/Hash";
import Int "mo:base/Int";

import Float "mo:base/Float";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

actor WaterTracker {
  stable var waterIntakeEntries : [(Text, Nat)] = [];
  var waterIntake = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);

  public func updateWaterIntake(date : Text, amount : Nat) : async [(Text, Nat)] {
    waterIntake.put(date, amount);
    waterIntakeEntries := Iter.toArray(waterIntake.entries());
    waterIntakeEntries
  };

  public query func getWaterIntake() : async [(Text, Nat)] {
    waterIntakeEntries
  };

  system func preupgrade() {
    waterIntakeEntries := Iter.toArray(waterIntake.entries());
  };

  system func postupgrade() {
    waterIntake := HashMap.fromIter<Text, Nat>(waterIntakeEntries.vals(), 0, Text.equal, Text.hash);
  };
}