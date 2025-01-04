import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { StrikeData } from './types.ts';
import { formatDateForPostgres } from './utils.ts';

export async function saveToDatabase(
  supabase: any,
  marketData: { entry: StrikeData; target: StrikeData; protection: StrikeData },
  userData: { ticker: string; expiration: string; profile_id: string; strikes: any }
) {
  const formattedExpiration = formatDateForPostgres(userData.expiration);
  
  try {
    const { data: existingRecord } = await supabase
      .from('diy_notes')
      .select('id')
      .eq('ticker', userData.ticker)
      .eq('expiration', formattedExpiration)
      .eq('profile_id', userData.profile_id)
      .single();

    const dbOperation = existingRecord ? 
      supabase
        .from('diy_notes')
        .update({
          strike_entry: userData.strikes.entry,
          strike_target: userData.strikes.target,
          strike_protection: userData.strikes.protection,
          strike_entry_mid: marketData.entry.marketData?.mid,
          strike_entry_open_interest: marketData.entry.marketData?.openInterest,
          strike_entry_iv: marketData.entry.marketData?.iv,
          strike_entry_delta: marketData.entry.marketData?.delta,
          strike_entry_intrinsic_value: marketData.entry.marketData?.intrinsicValue,
          strike_entry_extrinsic_value: marketData.entry.marketData?.extrinsicValue,
          strike_target_mid: marketData.target.marketData?.mid,
          strike_target_open_interest: marketData.target.marketData?.openInterest,
          strike_target_iv: marketData.target.marketData?.iv,
          strike_target_delta: marketData.target.marketData?.delta,
          strike_target_intrinsic_value: marketData.target.marketData?.intrinsicValue,
          strike_target_extrinsic_value: marketData.target.marketData?.extrinsicValue,
          strike_protection_mid: marketData.protection.marketData?.mid,
          strike_protection_open_interest: marketData.protection.marketData?.openInterest,
          strike_protection_iv: marketData.protection.marketData?.iv,
          strike_protection_delta: marketData.protection.marketData?.delta,
          strike_protection_intrinsic_value: marketData.protection.marketData?.intrinsicValue,
          strike_protection_extrinsic_value: marketData.protection.marketData?.extrinsicValue,
        })
        .eq('id', existingRecord.id) :
      supabase
        .from('diy_notes')
        .insert([{
          profile_id: userData.profile_id,
          ticker: userData.ticker,
          expiration: formattedExpiration,
          strike_entry: userData.strikes.entry,
          strike_target: userData.strikes.target,
          strike_protection: userData.strikes.protection,
          strike_entry_mid: marketData.entry.marketData?.mid,
          strike_entry_open_interest: marketData.entry.marketData?.openInterest,
          strike_entry_iv: marketData.entry.marketData?.iv,
          strike_entry_delta: marketData.entry.marketData?.delta,
          strike_entry_intrinsic_value: marketData.entry.marketData?.intrinsicValue,
          strike_entry_extrinsic_value: marketData.entry.marketData?.extrinsicValue,
          strike_target_mid: marketData.target.marketData?.mid,
          strike_target_open_interest: marketData.target.marketData?.openInterest,
          strike_target_iv: marketData.target.marketData?.iv,
          strike_target_delta: marketData.target.marketData?.delta,
          strike_target_intrinsic_value: marketData.target.marketData?.intrinsicValue,
          strike_target_extrinsic_value: marketData.target.marketData?.extrinsicValue,
          strike_protection_mid: marketData.protection.marketData?.mid,
          strike_protection_open_interest: marketData.protection.marketData?.openInterest,
          strike_protection_iv: marketData.protection.marketData?.iv,
          strike_protection_delta: marketData.protection.marketData?.delta,
          strike_protection_intrinsic_value: marketData.protection.marketData?.intrinsicValue,
          strike_protection_extrinsic_value: marketData.protection.marketData?.extrinsicValue,
        }]);

    const { error } = await dbOperation;
    return { success: !error, error };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database operation failed:`, error);
    return { success: false, error };
  }
}