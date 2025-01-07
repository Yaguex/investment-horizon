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
      .from('position_size')  // Changed from 'diy_notes' to 'position_size'
      .select('id')
      .eq('ticker', userData.ticker)
      .eq('expiration', formattedExpiration)
      .eq('profile_id', userData.profile_id)
      .single();

    // Get the underlying price from any of the strikes (they all have the same underlying)
    const underlyingPrice = marketData.entry.marketData?.underlyingPrice || 
                           marketData.target.marketData?.underlyingPrice || 
                           marketData.protection.marketData?.underlyingPrice;

    const dbOperation = existingRecord ? 
      supabase
        .from('position_size')  // Changed from 'diy_notes' to 'position_size'
        .update({
          underlying_price_entry: underlyingPrice,
          premium_entry: marketData.entry.marketData?.mid,
          delta_entry: marketData.entry.marketData?.delta,
          iv_entry: marketData.entry.marketData?.iv,
          premium_exit: marketData.target.marketData?.mid,
          delta_exit: marketData.target.marketData?.delta,
          iv_exit: marketData.target.marketData?.iv
        })
        .eq('id', existingRecord.id) :
      supabase
        .from('position_size')  // Changed from 'diy_notes' to 'position_size'
        .insert([{
          profile_id: userData.profile_id,
          ticker: userData.ticker,
          expiration: formattedExpiration,
          underlying_price_entry: underlyingPrice,
          premium_entry: marketData.entry.marketData?.mid,
          delta_entry: marketData.entry.marketData?.delta,
          iv_entry: marketData.entry.marketData?.iv,
          premium_exit: marketData.target.marketData?.mid,
          delta_exit: marketData.target.marketData?.delta,
          iv_exit: marketData.target.marketData?.iv
        }]);

    const { error } = await dbOperation;
    return { success: !error, error };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database operation failed:`, error);
    return { success: false, error };
  }
}