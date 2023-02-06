import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const deleteCollect = async (
  collect: string,
  subCollects?: string[],
) => {
  const collectRef = collection(db, collect);
  const collectDocs = await getDocs(collectRef);
  if (!collectDocs.empty) {
    let batch = writeBatch(db);
    let i = 0;
    for (const data of collectDocs.docs) {
      if (subCollects) {
        for (const subCollect of subCollects) {
          const subCollectDocs = await getDocs(
            collection(doc(collectRef, data.id), subCollect),
          );
          for (const subData of subCollectDocs.docs) {
            batch.delete(
              doc(collection(doc(collectRef, data.id), subCollect), subData.id),
            );
            i++;
            if (i > 400) {
              i = 0;
              await batch.commit();
              batch = writeBatch(db);
            }
          }
        }
      }
      batch.delete(doc(collectRef, data.id));
      i++;
      if (i > 400) {
        i = 0;
        await batch.commit();
        batch = writeBatch(db);
      }
    }
    if (i > 0) await batch.commit();
  }
};
