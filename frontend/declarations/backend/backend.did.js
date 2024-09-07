export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getWaterIntake' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'updateWaterIntake' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
