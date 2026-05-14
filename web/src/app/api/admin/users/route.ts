import { type NextRequest, NextResponse } from "next/server";
import {
  deleteUser,
  updateUserProfileType,
  adjustUserCoins,
  reduceDuplicateCharacter,
  getUserCollectionDetails,
  setUserFavorite,
  removeUserFavorite,
} from "@/app/admin/actions";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "getCollectionDetails": {
        const data = await getUserCollectionDetails(body.telegramId);
        return NextResponse.json(data);
      }
      case "deleteUser": {
        const result = await deleteUser(body.telegramId);
        return NextResponse.json(result);
      }
      case "updateUserProfileType": {
        const result = await updateUserProfileType(
          BigInt(body.telegramId),
          body.newProfileType,
        );
        return NextResponse.json(result);
      }
      case "adjustCoins": {
        const result = await adjustUserCoins(
          body.telegramId,
          body.amount,
          body.operation,
        );
        return NextResponse.json(result);
      }
      case "reduceDuplicate": {
        const result = await reduceDuplicateCharacter(
          body.telegramId,
          body.characterId,
          body.type,
          body.reduceBy,
        );
        return NextResponse.json(result);
      }
      case "setFavorite": {
        const result = await setUserFavorite(
          body.telegramId,
          body.characterId,
          body.type,
        );
        return NextResponse.json(result);
      }
      case "removeFavorite": {
        const result = await removeUserFavorite(body.telegramId, body.type);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
