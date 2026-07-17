import { getSupabaseClient } from '../lib/supabase'
import { normalizeSeasonalOffer, normalizeSeasonalOfferListResponse, seasonalOfferFormToPayload } from '../utils/seasonalOfferMapper'

export async function getSeasonalOffers(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_seasonal_offers', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeSeasonalOfferListResponse(data)
}

export async function getSeasonalOffer(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_seasonal_offer', {
    p_offer_id: id,
  })

  if (error) throw error

  return normalizeSeasonalOffer(data)
}

export async function createSeasonalOffer(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_seasonal_offer', {
    p_payload: seasonalOfferFormToPayload(form),
  })

  if (error) throw error

  return normalizeSeasonalOffer(data)
}

export async function updateSeasonalOffer(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_seasonal_offer', {
    p_offer_id: id,
    p_patch: seasonalOfferFormToPayload(form),
  })

  if (error) throw error

  return normalizeSeasonalOffer(data)
}

export async function deleteSeasonalOffer(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_seasonal_offer', {
    p_offer_id: id,
  })

  if (error) throw error

  return normalizeSeasonalOffer(data)
}

export function toggleSeasonalOfferStatus(offer) {
  return updateSeasonalOffer(offer.id, {
    title: offer.title,
    description: offer.description || '',
    discountType: offer.discount_type,
    discountValue: String(offer.discount_value),
    startDate: offer.start_date,
    endDate: offer.end_date,
    applyTo: offer.applicable_package_id ? 'package' : 'service',
    applicableServiceId: offer.applicable_service_id || '',
    applicablePackageId: offer.applicable_package_id || '',
    status: offer.status === 'active' ? 'inactive' : 'active',
  })
}
