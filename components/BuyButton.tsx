import { Button } from '@mantine/core';
import { ObjectId } from 'mongodb';

const BuyNowButton = ({ buyerEmail, sellerEmail, noteId, amount }: {
  buyerEmail: string;
  sellerEmail: string;
  noteId: ObjectId;
  amount: number;
}) => {
  const handleBuyNow = async () => {
    if (!buyerEmail) {
      alert("You must be logged in to buy notes.");
      return;
    }

    try {
      // Step 1: Check User's Points
      const pointsResponse = await fetch(`/api/users/points?email=${buyerEmail}`);
      const pointsData = await pointsResponse.json();

      if (!pointsResponse.ok || !pointsData.points) {
        alert("Failed to fetch user points.");
        return;
      }

      if (pointsData.points < amount) {
        alert(`Insufficient points. You have ${pointsData.points}, but need ${amount}.`);
        return;
      }

      // Step 2: Proceed with Purchase
      const buyResponse = await fetch(
        `/api/users/buy?buyerEmail=${buyerEmail}&sellerEmail=${sellerEmail}&noteId=${noteId}&amount=${amount}`,
        { method: "PATCH" }
      );
      const buyData = await buyResponse.json();

      if (buyResponse.ok) {
        alert("Purchase successful! The note has been added to your account.");
        window.location.reload(); // Refresh to update UI
      } else {
        alert(`Purchase failed: ${buyData.error}`);
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <Button color="blue" onClick={handleBuyNow}>
      Buy Now
    </Button>
  );
};

export default BuyNowButton;
